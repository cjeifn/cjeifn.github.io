---
title: 구성원
nav:
  order: 1
  tooltip: 구성원 소개
---

# {% include icon.html icon="fa-solid fa-users" %}구성원

청주교대 기초수리력 연구소의 연구진 및 참여 구성원을 소개합니다.

<style>
  .member-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
    width: 100%;
    margin: 16px 0 28px 0;
    box-sizing: border-box;
  }

  .member-card {
    background: #ffffff;
    border: 1px solid #eef2f6;
    border-radius: 12px;
    padding: 18px 16px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
  }

  .member-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }

  .member-name {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
  }

  .member-role {
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
  }
</style>

{% include section.html %}

## 연구소장

<div class="member-grid">
  <div class="member-card">
    <div class="member-name">송창근</div>
    <div class="member-role">청주교육대학교 교수</div>
  </div>
</div>

{% include section.html %}

## 연구원

<div class="member-grid">
  <div class="member-card">
    <div class="member-name">김동원</div>
    <div class="member-role">청주교육대학교 교수</div>
  </div>
  <div class="member-card">
    <div class="member-name">박영희</div>
    <div class="member-role">청주교육대학교 교수</div>
  </div>
  <div class="member-card">
    <div class="member-name">김남균</div>
    <div class="member-role">청주교육대학교 교수</div>
  </div>
  <div class="member-card">
    <div class="member-name">나귀수</div>
    <div class="member-role">청주교육대학교 교수</div>
  </div>
</div>

{% include section.html %}

## 연구원 (대학원 과정)

### 박사과정

<div class="member-grid">
  <div class="member-card">
    <div class="member-name">김응관</div>
    <div class="member-role">청주교육대학교 박사과정</div>
  </div>
  <div class="member-card">
    <div class="member-name">방민재</div>
    <div class="member-role">청주교육대학교 박사과정</div>
  </div>
  <div class="member-card">
    <div class="member-name">김수진</div>
    <div class="member-role">청주교육대학교 박사과정</div>
  </div>
</div>

### 석사과정

<div class="member-grid">
  <div class="member-card">
    <div class="member-name">임규남</div>
    <div class="member-role">청주교육대학교 석사과정</div>
  </div>
  <div class="member-card">
    <div class="member-name">이원우</div>
    <div class="member-role">청주교육대학교 석사과정</div>
  </div>
  <div class="member-card">
    <div class="member-name">이영후</div>
    <div class="member-role">청주교육대학교 석사과정</div>
  </div>
  <div class="member-card">
    <div class="member-name">정윤희</div>
    <div class="member-role">청주교육대학교 석사과정</div>
  </div>
</div>
