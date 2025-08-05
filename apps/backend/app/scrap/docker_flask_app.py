#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
docker_flask_app.py

Flask 웹 애플리케이션으로, AsilCrawler 모듈을 통해
원하는 지역·학교유형·지표를 선택하고 CSV를 생성/다운로드합니다.
"""
import os
import csv
from flask import Flask, render_template_string, request, redirect, url_for, flash, send_from_directory
from asil_crawler import AsilCrawler

# Flask 설정
app = Flask(__name__)
app.secret_key = 'change_this_secret'

# 저장 경로
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

crawler = AsilCrawler()

# 템플릿
TEMPLATE = """
<!doctype html>
<title>School Data Crawler</title>
<h1>학교알리미 데이터 크롤러</h1>
<form method=post>
  <label>시/도:
    <select name=province onchange="this.form.submit()">
      <option value=''>선택</option>
      {% for code,name in provinces.items() %}
        <option value="{{code}}" {% if code==sel_province %}selected{% endif %}>{{name}}</option>
      {% endfor %}
    </select>
  </label>
  <label>구/군:
    <select name=district>
      <option value=''>전체</option>
      {% for code,name in districts.items() %}
        <option value="{{code}}" {% if code==sel_district %}selected{% endif %}>{{name}}</option>
      {% endfor %}
    </select>
  </label><br>
  <label>학교유형:
    <select name=school_type>
      <option value='3'>중학교</option>
      <option value='4'>고등학교</option>
    </select>
  </label><br>
  <label>지표:
    <input type=checkbox name=metric value=achievement checked> 학업성취도
    <input type=checkbox name=metric value=progression> 진학률
  </label><br>
  <button type=submit>CSV 생성</button>
</form>
{% with messages = get_flashed_messages() %}
  {% if messages %}
    <ul style="color:red;">
    {% for m in messages %}<li>{{m}}</li>{% endfor %}
    </ul>
  {% endif %}
{% endwith %}
{% if files %}
  <h2>다운로드:</h2>
  <ul>
    {% for f in files %}
      <li><a href="{{ url_for('download_file', filename=f) }}">{{ f }}</a></li>
    {% endfor %}
  </ul>
{% endif %}
"""

@app.route('/', methods=['GET','POST'])
def index():
    provinces = crawler.get_province_codes()
    sel_province = request.form.get('province','')
    sel_district = request.form.get('district','')
    districts = crawler.get_district_codes(sel_province) if sel_province else {}
    files = []

    if request.method=='POST' and request.form.getlist('metric'):
        area = sel_district or sel_province
        if not area:
            flash('시/도 또는 구/군을 선택하세요.')
            return redirect(url_for('index'))

        s_type = request.form['school_type']
        for metric in request.form.getlist('metric'):
            order = '1' if metric=='achievement' else '7'
            data = crawler.fetch_school_list(area_code=area, type1=s_type, order=order, orderby='desc')
            fname = f"{metric}_{area}_{s_type}.csv"
            fpath = os.path.join(DATA_DIR, fname)
            if data:
                with open(fpath,'w',newline='',encoding='utf-8-sig') as f:
                    writer = csv.DictWriter(f, fieldnames=list(data[0].keys()))
                    writer.writeheader()
                    writer.writerows(data)
                files.append(fname)
            else:
                flash(f"{metric} 데이터가 없습니다.")
    return render_template_string(TEMPLATE, provinces=provinces,
                                  districts=districts,
                                  sel_province=sel_province,
                                  sel_district=sel_district,
                                  files=files)

@app.route('/data/<path:filename>')
def download_file(filename):
    return send_from_directory(DATA_DIR, filename, as_attachment=True)

if __name__=='__main__':
    app.run(host='0.0.0.0', port=5000)
    
