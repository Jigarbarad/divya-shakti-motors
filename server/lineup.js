// Specs researched online (Oct 2026) from Hero MotoCorp pages and Autocar India, BikeWale, Team-BHP, 91wheels, BikeLeague.
// Where sources disagreed, the most common figure is used and marked with "~"; blank = not confirmed.
// All figures are manufacturer-claimed and vary by variant, so the site tells customers to confirm at the showroom.
// Variants come from the dealer price list dated 03/10/2023 (ex-showroom), plus BUMP to match the owner's current estimate.
const BUMP = 20000;

const SPECS = {
  'Hero HF 100':      { engine: '97.2 cc, air-cooled, single cylinder', power: '8.02 PS @ 8,000 rpm', torque: '8.05 Nm', mileage: 'Up to 65 km/l (claimed)', tank: '~9.1 L', weight: '~110 kg', gearbox: '4-speed' },
  'Hero HF Deluxe':   { engine: '97.2 cc, air-cooled, single cylinder', power: '8.02 PS @ 8,000 rpm', torque: '8.05 Nm', mileage: 'Up to 65 km/l (claimed)', tank: '~9.1 L', weight: '109–112 kg (by variant)', gearbox: '4-speed' },
  'Hero Splendor+':   { engine: '97.2 cc, air-cooled, fuel-injected', power: '8.02 PS @ 8,000 rpm', torque: '8.05 Nm @ 6,000 rpm', mileage: '~60 km/l (claimed)', tank: '9.8 L', weight: '112 kg', gearbox: '4-speed', brakes: 'Drum / Drum (130 mm), with IBS' },
  'Hero Splendor+ Xtec': { engine: '97.2 cc, air-cooled, fuel-injected', power: '8.02 PS @ 8,000 rpm', torque: '8.05 Nm @ 6,000 rpm', mileage: '~68–73 km/l (claimed)', tank: '9.8 L', weight: '~112 kg', gearbox: '4-speed' },
  'Hero Passion Pro': { engine: '97.2 cc, air-cooled, single cylinder', power: '8.02 PS @ 8,000 rpm', torque: '8.05 Nm @ 6,000 rpm', mileage: '~60–70 km/l (claimed)', tank: '11 L', weight: '115 kg', gearbox: '4-speed' },
  'Hero Super Splendor Xtec': { engine: '124.7 cc, air-cooled, single cylinder', power: '~10.8 PS @ 7,500 rpm', torque: '10.6 Nm @ 6,000 rpm', mileage: '~68–69 km/l (claimed)', tank: '12 L', weight: '~122 kg', gearbox: '5-speed', brakes: 'Drum, or 240 mm front disc' },
  'Hero Glamour':     { engine: '124.7 cc, air-cooled, fuel-injected', power: '~10.5 PS', torque: '~10.5 Nm', mileage: '55–65 km/l (claimed, varies)', tank: '10 L', weight: '~122 kg' },
  'Hero Glamour X':   { engine: '124.7 cc, air-cooled, single cylinder', power: '~11.4 PS @ 8,250 rpm', torque: '10.5 Nm @ 6,500 rpm', mileage: '65 km/l (claimed)', tank: '10 L', weight: '125.5 kg (drum) / 127 kg (disc)', gearbox: '5-speed' },
  'Hero Glamour Xtec':{ engine: '124.7 cc, air-cooled, fuel-injected', power: '~10.7 PS @ 7,500 rpm', torque: '10.6 Nm @ 6,000 rpm', mileage: '~55 km/l (ARAI-rated)', tank: '10 L', weight: '~122 kg' },
  'Hero Xtreme 125R': { engine: '124.7 cc, air-cooled, single cylinder', power: '~11.4 PS @ 8,250 rpm', torque: '~10.5 Nm @ 6,500 rpm', mileage: '~66 km/l (ARAI-rated)', tank: '10 L', weight: '~136 kg' },
  'Hero Xtreme 160R 4V': { engine: '163.2 cc, 4-valve, single cylinder', power: '16.9 PS @ 8,500 rpm', torque: '14.6 Nm @ 6,500 rpm', tank: '12 L', weight: '~146 kg (144–148 kg)' },
  'Hero Xpulse 200 4V':{ engine: '199.6 cc, oil-cooled, single cylinder', power: '18.9 bhp @ 8,500 rpm', torque: '17.35 Nm @ 6,500 rpm', tank: '13 L', weight: '159–161 kg', gearbox: '5-speed' },
  'Hero Xpulse 210':  { engine: '210 cc, liquid-cooled, single cylinder', power: '24.2 bhp @ 9,250 rpm', torque: '20.7 Nm @ 7,250 rpm', tank: '13 L', weight: '~170 kg', gearbox: '6-speed, assist & slipper clutch' },
  'Hero Destini 125': { engine: '124.6 cc, air-cooled, single cylinder', power: '~9 bhp @ 7,000 rpm', torque: '10.4 Nm @ 5,500 rpm', mileage: 'Up to ~60 km/l (claimed)', tank: '~5.3 L', weight: '~115 kg' },
  'Hero Destini Prime':{ engine: '124.6 cc, air-cooled, single cylinder', power: '~9 bhp @ 7,000 rpm', torque: '~10.4 Nm @ 5,500 rpm', mileage: '~56 km/l (claimed)', tank: '~5 L', weight: '~115 kg' },
  'Hero Destini 110': { engine: '110.9 cc, air-cooled, single cylinder', power: '8.04 bhp @ 7,250 rpm', torque: '8.7 Nm @ 5,750 rpm', mileage: '56.2 km/l (claimed)', tank: '~5.3 L', weight: '~114 kg' },
  'Hero Pleasure+':   { engine: '110.9 cc, air-cooled, single cylinder', power: '~8 bhp @ 7,000 rpm', torque: '8.7 Nm @ 5,500 rpm', mileage: '~50 km/l (claimed)', tank: '4.8 L', weight: '~104 kg', brakes: 'Drum / Drum, with IBS' },
  'Hero Maestro Edge':{ engine: '124.6 cc, air-cooled, single cylinder', power: '~9 bhp', torque: '~10 Nm', mileage: '~45 km/l (listed)', tank: '~5 L', weight: '~112 kg' },
  'Hero Xoom 110':    { engine: '110.9 cc, air-cooled, single cylinder', power: '~8 bhp @ 7,250 rpm', torque: '8.7 Nm @ 5,750 rpm', tank: '~5.2 L', weight: '~108–109 kg' },
  'Hero Xoom 125':    { engine: '124.6 cc, air-cooled, single cylinder', power: '~9.8 bhp @ 7,250 rpm', torque: '10.4 Nm @ 6,000 rpm', tank: '~5 L', weight: '120 kg (drum) / 121 kg (disc)' },
  'Hero Xoom 160':    { engine: '156 cc, single cylinder', power: '~14.6 PS @ 8,000 rpm', torque: '~14 Nm @ 6,500 rpm', mileage: '~40 km/l (ARAI-rated)', tank: '7 L', weight: '142 kg' },
};

// [variant name, ex-showroom price from the 03/10/2023 list]
const RAW_VARIANTS = {
  'Hero HF 100': [['HF 100', 55518]],
  'Hero HF Deluxe': [['HF DLX DRK Cast', 60143], ['HF DLX DRK Cast E20', 60643], ['HF DLX 19 DRS Cast FI', 66718], ['HF DLX 19 DRS Cast FI E20', 67218],
    ['HF DLX 19 DRS Cast FI All Black', 67588], ['HF DLX 19 DRS Cast FI All Black E20', 68088], ['HF DLX 19 i3S DRS Cast FI', 68318], ['HF DLX 19 i3S DRS Cast FI E20', 68818]],
  'Hero Splendor+': [['Splendor+ DRS Cast FI Sensor E20', 75341], ['Splendor+ i3S DRS Cast FI Sensor E20 (All Black)', 76356], ['Splendor+ i3S Xtec E20', 79911]],
  'Hero Splendor+ Xtec': [['Splendor+ i3S Xtec E20', 79911]],
  'Hero Passion Pro': [['Passion+ FI DRS', 77821], ['Passion Pro FI DRS Xtec E20', 80538], ['Passion Pro FI DSS Xtec E20', 84338]],
  'Hero Super Splendor Xtec': [['Super Splendor FI DRS Cast Digital Xtec E20', 83988], ['Super Splendor FI DSS Cast Digital Xtec E20', 87988]],
  'Hero Glamour Xtec': [['Glamour FI DRS Xtec', 87948], ['Glamour FI DSS Xtec', 92948], ['Glamour FI DRS Xtec E20', 88748], ['Glamour FI DSS Xtec E20', 93748]],
  'Hero Pleasure+': [['Pleasure+ FI DRS Cast VX E20', 76708], ['Pleasure+ Xtec E20', 80198], ['Pleasure+ Xtec Jublion', 81298]],
  'Hero Destini Prime': [['Destini 125 FI DRS Prime', 75888]],
  'Hero Destini 125': [['Destini 125 FI DRS Xtec', 85308], ['Destini 125 FI DRS Xtec E20', 86008]],
  'Hero Xoom 110': [['Xoom 110 LX E20', 75595], ['Xoom 110 VX E20', 79128], ['Xoom 110 Xtec E20', 84028]],
  'Hero Xtreme': [['Xtreme 160R FI DSS', 123526], ['Xtreme 160R FI DDS', 128724]],
  'Hero Xtreme 160R 4V': [['Xtreme 160R FI DDS 4V', 138200]],
  'Hero Xpulse 200 4V': [['Xpulse 200 4V', 141026], ['Xpulse 200 4V Prime', 153151], ['Xpulse 200 4V Edition', 155748]],
};
const VARIANTS = Object.fromEntries(Object.entries(RAW_VARIANTS).map(([k, v]) => [k, v.map(([name, p]) => ({ name, price: p + BUMP }))]));

module.exports = { SPECS, VARIANTS };
