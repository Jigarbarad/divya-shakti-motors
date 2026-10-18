// Extra specs (suspension, tyres, dimensions...) and "best for" lines.
// Researched online (Oct 2026) from Hero MotoCorp pages, Autocar India, Team-BHP, BikeLeague, 91wheels, Shriram Finance.
// "~" marks figures where sources disagree. Colours and warranty are intentionally left out (they change by stock/offer).
// Xoom 125 is left blank because sources mix two different versions. The Gujarati lines are a draft for local review.
const T = {
  hf: 'Front: telescopic hydraulic; Rear: swingarm, 2-step adjustable hydraulic',
  sp: 'Front: telescopic hydraulic; Rear: swingarm, 5-step adjustable hydraulic',
  gl: 'Front: 30 mm telescopic; Rear: 5-step adjustable hydraulic',
  sc: 'Front: telescopic hydraulic; Rear: unit swing, spring-loaded hydraulic',
};

const EXTRA = {
  'Hero HF 100': { suspension: T.hf, tyres: '2.75-18 front and rear', dimensions: '1,965 × 720 × 1,045 mm', wheelbase: '1,235 mm', seat: '805 mm', clearance: '165 mm',
    best: ['First-time buyers and budget riders', 'પહેલી વાર બાઇક લેનાર અને બજેટ જોનાર સવારો'] },
  'Hero HF Deluxe': { suspension: T.hf, tyres: '2.75-18 front and rear', wheelbase: '1,235 mm', seat: '805 mm', clearance: '165 mm',
    best: ['Daily commuters who want low running costs', 'ઓછા ખર્ચે રોજિંદી મુસાફરી કરનારા સવારો'] },
  'Hero Splendor+': { suspension: T.sp, tyres: '80/100-18 front and rear, tubeless', dimensions: '2,000 × 720 × 1,052 mm', wheelbase: '1,236 mm', seat: '785 mm', clearance: '~165 mm',
    best: ['Daily commuters, office-goers and students', 'રોજિંદી મુસાફરી કરનાર, નોકરિયાત અને વિદ્યાર્થીઓ'] },
  'Hero Splendor+ Xtec': { suspension: T.sp, tyres: '80/100-18 front and rear, tubeless', dimensions: '2,000 × 720 × 1,052 mm', wheelbase: '1,236 mm', seat: '785 mm', clearance: '~165 mm',
    best: ['Commuters who want extra tech and convenience', 'વધારાની ટેક્નોલોજી અને સુવિધા ઇચ્છતા સવારો'] },
  'Hero Passion Pro': { suspension: 'Front: telescopic; Rear: twin tube', tyres: '80/100-18 front and rear, tubeless', dimensions: '1,982 × 770 × 1,087 mm', wheelbase: '1,235 mm', seat: '790 mm', clearance: '168 mm',
    best: ['Commuters who like a stylish look', 'સ્ટાઇલિશ દેખાવ પસંદ કરતા રોજિંદા સવારો'] },
  'Hero Super Splendor Xtec': { suspension: T.sp, tyres: '80/100-18 front, 90/90-18 rear, tubeless', dimensions: '2,042 × ~740 × ~1,092 mm', wheelbase: '~1,267 mm', seat: '~793 mm', clearance: '~180 mm',
    best: ['Riders who want a bit more engine than a 100 cc commuter', '100 cc કરતાં થોડું વધુ એન્જિન ઇચ્છતા સવારો'] },
  'Hero Glamour': { suspension: T.gl, tyres: '80/100-18 front, 100/80-18 rear, tubeless', wheelbase: '~1,273 mm', seat: '~793 mm', clearance: '~180 mm',
    best: ['Daily riders who want a smart-looking 125 cc', 'સ્માર્ટ દેખાવની 125 cc ઇચ્છતા રોજિંદા સવારો'] },
  'Hero Glamour X': { suspension: T.gl, tyres: '80/100-18 front, 100/80-18 rear, tubeless', dimensions: '2,045 × ~796 × ~1,126 mm', wheelbase: '1,267 mm', seat: '790 mm', clearance: '170 mm',
    best: ['Riders who want modern styling and features', 'આધુનિક સ્ટાઇલ અને ફીચર્સ ઇચ્છતા સવારો'] },
  'Hero Glamour Xtec': { suspension: T.gl, tyres: '80/100-18 front, 100/80-18 rear, tubeless', dimensions: '2,051 × 743 × 1,074 mm', wheelbase: '1,273 mm', seat: '~793–798 mm', clearance: '180 mm',
    best: ['Tech-loving daily commuters', 'ટેક્નોલોજી પસંદ કરતા રોજિંદા સવારો'] },
  'Hero Xtreme 125R': { suspension: 'Front: 37 mm telescopic; Rear: 7-step adjustable monoshock', tyres: '90/90-17 front, 120/80-17 rear, tubeless', dimensions: '2,009 × 793 × 1,051 mm', wheelbase: '1,319 mm', seat: '794 mm', clearance: '180 mm',
    best: ['Young riders who want sporty looks in 125 cc', '125 cc માં સ્પોર્ટી લુક ઇચ્છતા યુવા સવારો'] },
  'Hero Xtreme 160R 4V': { suspension: 'Front: 37 mm KYB upside-down fork; Rear: 7-step adjustable monoshock', tyres: '100/80-17 front, 130/70 R17 rear, tubeless', dimensions: '2,029 × 793 × 1,052 mm', wheelbase: '~1,333 mm', seat: '~795–800 mm', clearance: '165 mm',
    best: ['Enthusiasts who want performance and sharp handling', 'પરફોર્મન્સ અને શાર્પ હેન્ડલિંગ ઇચ્છતા શોખીન સવારો'] },
  'Hero Xpulse 200 4V': { suspension: 'Front: 37 mm telescopic, 190 mm travel; Rear: adjustable monoshock, 170 mm travel', tyres: '90/90-21 front, 120/80-18 rear', wheelbase: '1,410 mm', seat: '825 mm', clearance: '~220 mm',
    best: ['Adventure riders, tourers and rough-road riders', 'એડવેન્ચર, ટૂરિંગ અને ખરાબ રસ્તે ચલાવનાર સવારો'] },
  'Hero Xpulse 210': { suspension: 'Front: telescopic fork, 210 mm travel; Rear: monoshock, 205 mm travel', tyres: '90/90-21 front, 120/80-18 rear', wheelbase: '1,446 mm', seat: '830 mm', clearance: '220 mm',
    best: ['Long-distance and adventure riders', 'લાંબા અંતર અને એડવેન્ચર સવારો'] },
  'Hero Destini 125': { suspension: 'Front: telescopic; Rear: single coil-spring hydraulic', tyres: '90/90-12 front, 100/80-12 rear, tubeless', wheelbase: '1,302 mm', seat: '770 mm', clearance: '162 mm',
    best: ['Families and city riders', 'પરિવારો અને શહેરમાં ચલાવનારા સવારો'] },
  'Hero Destini Prime': { suspension: 'Front: telescopic; Rear: single coil-spring hydraulic', tyres: '90/100-10 front and rear, tubeless', dimensions: '1,809 × 729 × 1,154 mm', wheelbase: '1,245 mm', seat: '778 mm', clearance: '155 mm',
    best: ['Families and everyday city errands', 'પરિવારો અને રોજિંદા શહેરી કામ'] },
  'Hero Destini 110': { suspension: 'Front: telescopic; Rear: single coil-spring hydraulic', tyres: '90/90-12 front, 100/80-12 rear, tubeless', dimensions: '1,859 × ~700 × 1,125 mm', wheelbase: '1,302 mm', seat: '770 mm', clearance: '162 mm',
    best: ['First-time scooter riders and light daily use', 'પહેલી વાર સ્કૂટર ચલાવનાર અને હળવા રોજિંદા ઉપયોગ માટે'] },
  'Hero Pleasure+': { suspension: 'Front: bottom-link fork; Rear: swingarm, spring-loaded hydraulic', tyres: '90/100-10 front and rear, tubeless', dimensions: '1,769 × 704 × 1,161 mm', wheelbase: '1,238 mm', seat: '765 mm', clearance: '155 mm',
    best: ['Students and women riders who want a light, easy scooter', 'હળવું અને સરળ સ્કૂટર ઇચ્છતા વિદ્યાર્થીઓ અને મહિલા સવારો'] },
  'Hero Maestro Edge': { suspension: T.sc.replace('hydraulic;', 'hydraulic;'), tyres: '80/100-12 front, 100/80-10 rear', dimensions: '1,843 × 718 × ~1,139 mm', wheelbase: '1,261 mm', seat: '~775–793 mm', clearance: '155 mm',
    best: ['Riders who want a sporty-looking automatic', 'સ્પોર્ટી દેખાવનું ઓટોમેટિક ઇચ્છતા સવારો'] },
  'Hero Xoom 110': { suspension: T.sc, tyres: '90/90-12 front, 100/80-12 rear', dimensions: '1,881 × ~717 × 1,118 mm', wheelbase: '1,300 mm', seat: '770 mm', clearance: '155 mm',
    best: ['Young city riders', 'શહેરના યુવા સવારો'] },
  'Hero Xoom 125': { best: ['Young riders who want a sporty 125 cc scooter', 'સ્પોર્ટી 125 cc સ્કૂટર ઇચ્છતા યુવા સવારો'] },
  'Hero Xoom 160': { suspension: 'Front: telescopic hydraulic; Rear: dual shock absorbers', tyres: '120/70-14 front, 140/60-14 rear, tubeless', dimensions: '1,983 × 772 × 1,214 mm', wheelbase: '1,348 mm', seat: '787 mm', clearance: '155 mm',
    best: ['Riders who want a premium, maxi-style scooter', 'પ્રીમિયમ, મેક્સી-સ્ટાઇલ સ્કૂટર ઇચ્છતા સવારો'] },
};

module.exports = { EXTRA };
