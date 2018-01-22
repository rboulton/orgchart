import csv
import os
from jinja2 import Template
from collections import Counter
import re

this_dir = os.path.dirname(os.path.abspath(__file__))
template_file = os.path.join(this_dir, 'template.html')

template = Template(open(template_file).read())

csv_data = list(csv.reader(open('org_chart.csv')))

csv_rows = []
people = {}
for row in csv_data[1:]:
    _, _, person, team, community, title, manager, _ = row
    csv_rows.append((person, manager, title, team, community))
    record = people.setdefault(person, {})
    record.update(dict(
        name = person,
        team = team,
        community = community,
        title = title,
        manager = manager,
    ))
    manager_record = people.setdefault(manager, dict(name=manager))
    manager_record.setdefault('reports', []).append(person)

top = []
for name, record in people.items():
    if 'manager' not in record:
        top.append(name)

def slug(text):
    return re.sub('[^a-z0-1]+', '-', text.lower())

teams = Counter()
communities = Counter()
titles = Counter()

def genStructure(name, depth):
    record = people[name]
    team = record.get('team', '') or 'other'
    community = record.get('community', '') or 'other'
    title = record.get('title', '') or 'other'

    text = '%s<br>%s<br>%s' % (title, team, community)

    result = dict(
        name = name,
        title = text,
    )

    reports = record.get('reports')
    if reports is not None:
        result['children'] = [
            genStructure(childname, depth + 1)
            for childname in reports
        ]
        result['name'] = "{} ({})".format(name, len(reports))

    classes = []
    teams[slug(team)] += 1
    communities[slug(community)] += 1
    titles[slug(title)] += 1
    classes.append('team-%s' % (slug(team)))
    classes.append('community-%s' % (slug(community)))
    classes.append('title-%s' % (slug(title)))
    if classes:
        result['className'] = ' '.join(classes)

    return result

data = {}
data['name'] = 'Kevin Cunnington'
data['title'] = 'Kevin Cunnington'
data['children'] = [
    genStructure(name, 1)
    for name in top
]

team_styles = {
    'verify': {
        'content': '',
        'title': 'background-color: #307534',
    },
    'gov-uk': {
        'content': '',
        'title': 'background-color: #005ea5',
    },
    'gaap-notify': {
        'content': '',
        'title': 'background-color: #8b0000',
    },
    'gaap-open-registers': {
        'content': '',
        'title': 'background-color: #8b0000',
    },
    'gaap-paas': {
        'content': '',
        'title': 'background-color: #b16aef',
    },
    'gaap-pay': {
        'content': '',
        'title': 'background-color: #8b0000',
    },
    'gaap-submit': {
        'content': '',
        'title': 'background-color: #8b0000',
    },
    'digital-marketplace': {
        'content': '',
        'title': 'background-color: #711090',
    },
    'technology-and-operations': {
        'content': '',
        'title': 'background-color: #a3a707',
    },
    'service-design-standards': {
        'content': '',
        'title': 'background-color: #0a2ff5cc',
    },
    'tech-standards': {
        'content': '',
        'title': 'background-color: #00abd4cc',
    },
    'community': {
        'content': '',
        'title': 'background-color: #000000',
    },
#    better-use-of-data
#    cts
}

with open('output.html', 'wb') as fobj:
    fobj.write(template.render({
        'title': 'Org Chart',
        'team_styles': team_styles,
        'data': data,
        'csvdata': csv_rows,
        'teams': sorted(teams.items()),
        'communities': sorted(communities.items()),
        'titles': sorted(titles.items()),
    }).encode('utf8'))
