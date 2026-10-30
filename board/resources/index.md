---
title: 자료실
resources: []
---

# {% include icon.html icon="fa-solid fa-folder-open" %}자료실

{% include section.html %}

{% assign resources = page.resources | sort: "date" | reverse %}

<div class="resource-board" role="region" aria-label="자료실 목록" tabindex="0">
  <table class="resource-board__table">
    <caption class="resource-board__caption">자료실 게시글 목록</caption>
    <colgroup>
      <col class="resource-board__number">
      <col class="resource-board__title">
      <col class="resource-board__date">
      <col class="resource-board__views">
    </colgroup>
    <thead>
      <tr>
        <th scope="col">번호</th>
        <th scope="col">제목</th>
        <th scope="col">날짜</th>
        <th scope="col">조회</th>
      </tr>
    </thead>
    <tbody>
      {% for resource in resources %}
        <tr>
          <td class="resource-board__number">{{ forloop.rindex }}</td>
          <td class="resource-board__title">
            <a href="{{ resource.url | relative_url | escape }}">{{ resource.title | escape }}</a>
          </td>
          <td class="resource-board__date"><time datetime="{{ resource.date | date: '%Y-%m-%d' }}">{{ resource.date | date: "%Y-%m-%d" }}</time></td>
          <td class="resource-board__views">{{ resource.views | default: "—" | escape }}</td>
        </tr>
      {% else %}
        <tr>
          <td class="resource-board__empty" colspan="4">등록된 자료가 없습니다.</td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

[게시판으로 돌아가기]({{ "/board/" | relative_url }})
