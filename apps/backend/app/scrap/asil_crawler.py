"""
asil_crawler.py
=================

This module provides a simple crawler for the ``학교 알리미``
school list pages hosted at ``asil.kr``.  The public web interface does
not change its URL when the user navigates between provinces or
districts; instead it submits a form via POST to the same endpoint
(``/asil/sub/school_list.jsp``).  To support automated data
collection, this script reproduces the form submissions using the
``requests`` library and parses the resulting HTML with
``BeautifulSoup``.  It can fetch both the list of available area
codes and the detailed table of schools for a given area.

Usage example::

    from asil_crawler import AsilCrawler

    crawler = AsilCrawler()
    # Fetch top‑level area codes (provinces)
    provinces = crawler.get_province_codes()
    # Choose Seoul (code ``'11'``) and fetch its district codes
    districts = crawler.get_district_codes('11')
    # Fetch middle school data for Gangnam‑gu (code ``'11680'``)
    data = crawler.fetch_school_list(area_code='11680', type1='3')
    for row in data:
        print(row['school_name'], row['average'])

The crawler uses a persistent session and populates common headers
(``User‑Agent``, ``Referer`` and ``Origin``) to avoid being
blocked by the server.  Requests are made over HTTP rather than
HTTPS because the server only responds correctly on the HTTP
endpoint.

Note: This module performs network access.  When running in
environments that restrict outbound HTTP traffic, you may need to
download the HTML manually through a browser and save it to disk.
In such cases you can still parse the saved HTML using the helper
``parse_school_list`` function.
"""

from __future__ import annotations

import re
from typing import Dict, List, Tuple, Iterable, Optional

import bs4  # type: ignore
import requests


class AsilCrawler:
    """Crawler for the ASIL school ranking pages.

    The web site uses an HTML form to select areas and ordering
    parameters.  This class encapsulates the necessary POST requests
    and exposes convenience methods to discover available area codes
    and to fetch the table data.

    Attributes
    ----------
    base_url : str
        Base URL of the school list endpoint.  The server only
        responds correctly on the HTTP version; HTTPS returns an
        empty page.
    session : requests.Session
        Persistent session used for all HTTP requests.  Custom
        headers are applied to each request via
        ``session.headers.update``.
    """

    def __init__(self) -> None:
        self.base_url = "http://asil.kr/asil/sub/school_list.jsp"
        self.session = requests.Session()
        # Provide a realistic User‑Agent to avoid being blocked.  The
        # Referer and Origin headers mimic what the browser would send
        # when submitting the form.
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/115.0 Safari/537.36"
            ),
            "Referer": self.base_url,
            "Origin": "http://asil.kr",
        })

    @staticmethod
    def _parse_options(select: bs4.Tag) -> Dict[str, str]:
        """Parse an HTML ``select`` element into a mapping.

        Parameters
        ----------
        select : bs4.Tag
            The ``select`` tag whose ``option`` children should be
            parsed.

        Returns
        -------
        dict
            Mapping of option values to their human‑readable labels.
        """
        options: Dict[str, str] = {}
        for opt in select.find_all("option"):
            val = opt.get("value") or ""
            text = opt.get_text(strip=True)
            options[val] = text
        return options

    def _get_page(self, **form: str) -> str:
        """Fetch the school list page with the given form parameters.

        The site uses POST requests.  This helper performs a POST
        submission using the session.  Should the request fail with
        HTTP 403, a ``RuntimeError`` is raised with a helpful error
        message.

        Parameters
        ----------
        **form : str
            Form fields such as ``area``, ``type1``, ``order`` and
            ``orderby``.  Missing fields will use reasonable defaults.

        Returns
        -------
        str
            Raw HTML content of the response.
        """
        # Default values mirror those in the form found in the page
        payload = {
            "area": form.get("area", "00"),      # 전국 by default
            "type1": form.get("type1", "3"),     # 중학교 by default
            "order": form.get("order", "1"),     # 학업성취도순
            "orderby": form.get("orderby", "desc"),
        }
        response = self.session.post(self.base_url, data=payload)
        # Many sites return 200 status codes even on errors.  Check
        # explicitly for a tiny content length, which may be the
        # restricted page returned by our environment.  Still raise
        # for_status to capture 4xx/5xx responses.
        try:
            response.raise_for_status()
        except requests.HTTPError as err:
            msg = (
                f"Failed to fetch data from {self.base_url}: "
                f"HTTP {response.status_code}."
            )
            raise RuntimeError(msg) from err
        if len(response.content) < 500:
            # When running in the LLAMA container the remote host
            # returns a short error page instructing the user to use
            # the browser.  Surface this as a runtime error to the
            # caller rather than silently returning an empty page.
            raise RuntimeError(
                "Received unexpectedly small response. "
                "This may indicate network restrictions in the "
                "current environment."
            )
        return response.text

    def get_province_codes(self) -> Dict[str, str]:
        """Return a mapping of top‑level province codes to names.

        The first ``select`` element in the HTML contains options
        labelled '전국', '서울', '경기', etc.  This method fetches the
        initial page and extracts those options.

        Returns
        -------
        dict
            Mapping from the two‑digit area codes to province names.
        """
        html = self._get_page()
        soup = bs4.BeautifulSoup(html, "html.parser")
        select = soup.find("select", attrs={"onchange": re.compile(r"setArea")})
        if not select:
            raise RuntimeError("Failed to locate province select element.")
        return self._parse_options(select)

    def get_district_codes(self, province_code: str) -> Dict[str, str]:
        """Return district codes for a given province.

        The second ``select`` element lists districts under the
        selected province.  To obtain it for a specific province, this
        method performs a request with ``area=province_code`` and
        parses the resulting options.

        Parameters
        ----------
        province_code : str
            Two‑digit code of the province.

        Returns
        -------
        dict
            Mapping from district codes (usually five digits) to
            district names.  The first entry may correspond to the
            entire province (e.g., '11' => '시구군').
        """
        html = self._get_page(area=province_code)
        soup = bs4.BeautifulSoup(html, "html.parser")
        selects = soup.find_all("select", attrs={"onchange": re.compile(r"setArea")})
        if len(selects) < 2:
            raise RuntimeError("Failed to locate district select element.")
        # The second select corresponds to districts within the province.
        return self._parse_options(selects[1])

    @staticmethod
    def parse_school_list(html: str) -> List[Dict[str, str]]:
        """Parse a raw HTML page into a list of school data.

        The result table has the following columns: rank, location,
        school name, examinee count, average, Korean, English,
        Mathematics, special school admission rate, special admission
        breakdown, and number of graduates.  This parser extracts
        those columns into a list of dictionaries.

        Parameters
        ----------
        html : str
            Raw HTML content of the school list page.

        Returns
        -------
        list of dict
            A list of rows, each represented as a dictionary with
            descriptive keys.
        """
        soup = bs4.BeautifulSoup(html, "html.parser")
        table_div = soup.find("div", class_="tbList")
        if not table_div:
            raise RuntimeError("Failed to locate table container.")
        tbody = table_div.find("tbody")
        if not tbody:
            # In some cases (e.g. no data) there may be no tbody.
            return []
        rows: List[Dict[str, str]] = []
        for tr in tbody.find_all("tr"):
            cols = [td.get_text(strip=True) for td in tr.find_all("td")]
            if not cols:
                continue
            # Map the columns to names.
            row = {
                "rank": cols[0],
                "location": cols[1],
                "school_name": cols[2],
                "examinee_count": cols[3],
                "average": cols[4],
                "korean": cols[5],
                "english": cols[6],
                "math": cols[7],
                "special_rate": cols[8],
                "special_breakdown": cols[9],
                "graduates": cols[10],
            }
            rows.append(row)
        return rows

    def fetch_school_list(
        self,
        area_code: str,
        type1: str = "3",
        order: str = "1",
        orderby: str = "desc",
    ) -> List[Dict[str, str]]:
        """Fetch and parse the school list for a given area.

        Parameters
        ----------
        area_code : str
            Area code for which to fetch data.  May be the
            two‑digit province code or a more specific five‑digit
            district code.  Passing the province code returns the
            aggregated data for the entire province.
        type1 : str, optional
            ``'3'`` for 중학교 (middle schools) or ``'4'`` for 고등학교
            (high schools).  Defaults to ``'3'``.
        order : str, optional
            Sort criteria: ``'1'`` for 학업성취도순 (achievement
            score order), ``'7'`` for 진학률순 (advancement rate order).
            Defaults to ``'1'``.
        orderby : str, optional
            ``'asc'`` or ``'desc'`` for ascending or descending
            ordering.  Defaults to ``'desc'``.

        Returns
        -------
        list of dict
            Parsed table data.  Each entry is a dictionary with keys
            ``rank``, ``location``, ``school_name`` and so on.
        """
        html = self._get_page(area=area_code, type1=type1, order=order, orderby=orderby)
        return self.parse_school_list(html)


__all__ = ["AsilCrawler"]