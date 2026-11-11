import re,json,pathlib,sys
if len(sys.argv) != 2:
 raise SystemExit('Usage: python3 scripts/generate-course-metadata.py /absolute/path/to/catalog.txt')
s=pathlib.Path(sys.argv[1]).read_text()
subjects={'ACCOUNTING':'ACT','AFRICAN AMERICAN STUDIES':'AAS','AMERICAN STUDIES':'AMST','ANTHROPOLOGY':'ANTH','ARABIC':'ARAB','ART':'ART','ASTRONOMY':'ASTR','BIOLOGY':'BIOL','CHEMISTRY':'CHEM','CHINESE':'CHN','COMPUTER SCIENCE':'CS','DANCE':'DANC','DATA SCIENCE':'DASCI','DISCOVERY SEMINAR':'DSC','ECONOMICS':'ECON','ENGLISH':'ENG','ENVIRONMENTAL SCIENCE':'ENVS','ENVIRONMENTAL SCIENCES':'ENVS','FILM AND MEDIA':'FILM','FILM AND MEDIA STUDIES':'FILM','FRENCH':'FREN','GERMAN':'GER','HISTORY':'HIST','INTERDISCIPLINARY STUDIES':'IDS','LATIN AMERICAN AND CARIBBEAN STUDIES':'LACS','LATIN':'LAT','LINGUISTICS':'LING','MATHEMATICS':'MATH','MIDDLE EASTERN AND SOUTH ASIAN STUDIES':'MESAS','MUSIC':'MUS','NEUROSCIENCE AND BEHAVIORAL BIOLOGY':'NBB','NURSING':'NRSG','OXFORD COLLEGE SEMINAR':'OCS','OXFORD STUDIES':'OXST','PHYSICAL EDUCATION':'PE','PHILOSOPHY':'PHIL','PHYSICS':'PHYS','POLITICAL SCIENCE':'POLS','PSYCHOLOGY':'PSYC','RELIGION':'REL','SOCIOLOGY':'SOC','SPANISH':'SPAN','THEATER STUDIES':'THEA','THEATRE STUDIES':'THEA',"WOMEN’S, GENDER, AND SEXUALITY STUDIES":'WGS',"WOMEN'S, GENDER, AND SEXUALITY STUDIES":'WGS'}
subjects.update({'FILM':'FILM','NEUROSCIENCE AND BEHAVIORAL SCIENCE':'NBB','OXST':'OXST'})
pattern=re.compile(r'^(?P<subject>'+ '|'.join(re.escape(x) for x in sorted(subjects,key=len,reverse=True))+r')\s+(?P<number>\d{3})(?P<suffix>[A-Z]*)\s*[—–-]\s*(?P<title>[^\n]+)(?P<body>.*?)(?=\n(?:'+ '|'.join(re.escape(x) for x in sorted(subjects,key=len,reverse=True))+r')\s+\d{3}[A-Z]*\s*[—–-]|\Z)',re.M|re.S)
# The body delimiter also recognizes headings; tags are taken ONLY from the title.
rows={}
for m in pattern.finditer(s):
 code=subjects[m['subject']]+'_OX'+m['number']+m['suffix']
 tags=re.findall(r'\b(HA|NS|QR|SS|FW|IC|ETHN|DSC|PE)\b', ' '.join(re.findall(r'\(([^)]*)\)',m['title'])))
 tags=['PED' if t=='PE' else t for t in tags]
 body=m['body'].split('\n\n')[0]
 eligible=int(m['number'])<200 and not re.search(r'prerequisit|co[\s-]*requisit|permission|placement|audition|heritage|native speaker|varsity|intermediate|calculus ii',m['title']+' '+body,re.I)
 rows[code]={'ger':sorted(set(tags)),'introductory':eligible}
# The creative-writing subject uses ENGCW in OPUS, English in the printed catalog.
for n in ['270','271','272']:
 if 'ENG_OX'+n in rows:rows['ENGCW_OX'+n]=rows['ENG_OX'+n]
for n in ['100','110','150','151','210']:
 if 'DASCI_OX'+n in rows:rows['QTM_OX'+n]=rows['DASCI_OX'+n]
pathlib.Path('data/course-catalog.json').write_text(json.dumps({'source':'https://oxford.emory.edu/catalog/documents/26-27-ox-catalog_01.30.26.pdf','verifiedAt':'2026-11-10','courses':rows},ensure_ascii=False,indent=2)+'\n')
print('Extracted',len(rows),'course metadata records')
print(sorted(set(k.split('_')[0] for k in rows)))
