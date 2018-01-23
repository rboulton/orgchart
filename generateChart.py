import csv
import os
from jinja2 import Template

this_dir = os.path.dirname(os.path.abspath(__file__))
template_file = os.path.join(this_dir, 'template.html')

template = Template(open(template_file).read())

csv_data = list(csv.reader(open('org_chart.csv')))

csv_rows = []
for row in csv_data[1:]:
    _, _, person, team, community, title, manager, _ = row
    csv_rows.append((person, manager, title, team, community))

with open('output.html', 'wb') as fobj:
    fobj.write(template.render({
        'csvdata': csv_rows,
    }).encode('utf8'))
