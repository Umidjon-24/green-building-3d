/* ECON330 concept estimate. USD rates exclude VAT; dated source register below.
 * S = directly sourced input, A = source-anchored allowance, E = estimator allowance.
 * No line is a contractor tender. Quantities are concept assumptions, not a measured BOQ.
 */
const COST = {
  date: '17 November 2026', fx: 12023.61, gfa: 2900, net: 2400, units: 40, site: 2500,
  target: 550 * 2900,
  categories: { A:'Site and land', B:'Structure and exterior', C:'Mechanical, electrical and plumbing', D:'Interior finishes', E:'Landscape and community', F:'Indirect, risk, tax and finance' },
  sources: {
    QS:{name:'Estimator assumption — concept design, 17 Nov 2026',url:null,note:'Unquoted allowance. Includes local labour, delivery, minor plant, waste and trade overhead/profit unless a row separates them. Not a published Uzbekistan price.'},
    FX:{name:'Central Bank of Uzbekistan — exchange rate',url:'https://cbu.uz/uz/?VOICE=Y',note:'17 Nov 2026: USD 1 = UZS 12,023.61. Accounting conversion, not a bank dealing quote.'},
    CON:{name:'Aznur Beton, Samarkand — M300',url:'https://aznur.uz/catalog/beton/beton-m300',note:'Updated 23 Oct 2026: UZS 600,000/m³ ex works, delivery extra. VAT inclusion not explicit; treated as gross for the anchor. M300 is a price reference, not the structural engineer’s specified grade.'},
    STEEL:{name:'IRON BUILDING seller listing — reinforcement',url:'https://stroyka.uz/offer/metalloprokat',note:'Updated 25 Aug 2026: from UZS 9.5m/t; related sizes UZS 9.6–10.1m/t. VAT and certified seismic grade require confirmation. Assumed gross for the anchor; fixing, laps and delivery allowed separately/in installed rates.'},
    AAC:{name:'G-BLOCK, Samarkand region — block prices',url:'https://g-block.uz/ru/stati/cena-kladki-gazobloka/',note:'26 Aug 2026: approximately UZS 500,000/m³ excluding VAT; bank transfer price UZS 560,000 including 12%. Transport and laying extra.'},
    AAC2:{name:'ARTON — autoclaved block catalogue',url:'https://www.arton.uz/',note:'Accessed 17 Nov 2026; list not explicitly dated. UZS 780,000/m³ including VAT, ex works. Product and transport differences support the upper allowance.'},
    INS:{name:'Basalt seller catalogue — 100 mm facade insulation',url:'https://stroyka.uz/org/basalt/vata-mineralnaya',note:'Accessed 17 Nov 2026; undated list. Vent-facade board UZS 93,456/m², material only. This is a cost anchor, not approval for use under render; specify certified ETICS board/system.'},
    WIN:{name:'ASABIYYA — PVC window catalogue',url:'https://asabiyya.uz/katalog/okna/',note:'Accessed 17 Nov 2026; undated list. Quattro PVC range UZS 700,000–1,400,000/m². Opening pattern, glass specification, Samarkand installation and VAT must be quoted.'},
    PV:{name:'ANDIJAN YASHIL ENERGIYA — 30 kW on-grid system',url:'https://stroyka.uz/offer/30-kvt-on-grid-solnecnaya-fotoelektriceskaya-stanciya',note:'Opened listing updated 24 Sep 2026: UZS 120m per 30 kW system. Detailed supply/install split and VAT unclear. Adopt net-equivalent equipment anchor plus separate roof installation and connection allowances. No batteries.'},
    TILE:{name:'MILANO / Orient Ceramic — 60 × 60 tile',url:'https://stroyka.uz/offer/keramogranit-60x60-matovyi-model-2200',note:'Updated 11 Feb 2026: from UZS 51,000/m² supply only. Rates below add waste, adhesive, grout, transport and laying; reconfirm slip rating and stock.'},
    LIFT:{name:'Uplift Sistems — 630 kg machine-room-less passenger lift',url:'https://stroyka.uz/offer/passazirskii-lift-630-kg-8-cel-bmp-1-ms',note:'Updated 5 Oct 2026: from UZS 165,394,000/system, 1 m/s, 630 kg. Stop count, installation, VAT and delivery not fully specified. Net anchor approx. USD 12,282 if VAT-inclusive; budget equipment USD 13,000–22,000 plus separate install, shaft and power allowances. A five-stop accessible specification requires a quote.'},
    VAT:{name:'Government — 2026 standard VAT rate',url:'https://gov.uz/oz/urganch/news/view/138410',note:'3 Mar 2026: standard VAT 12%. Budget assumes unrecoverable VAT on taxable works/services; no blanket VAT on land, interest or tax itself. Actual developer recovery/exemption needs tax advice.'},
    ELEC:{name:'Cabinet Resolution 243 — energy tariffs',url:'https://www.lex.uz/docs/-8195731?ONDATE=01.11.2026+00',note:'From 1 Jun 2026: groups I/II/IV electricity UZS 1,100/kWh incl. VAT; ordinary household bands start 650/900/1,100. Gas general tariff UZS 2,000/m³, household base UZS 1,100. Meter/account classification must be confirmed.'},
    WATER:{name:'Samarkand council decision, 24 March 2025',url:'https://samarkand.uz/uploads/news_foto/2022/11/40-Suv-tarifi-oshirish.pdf',note:'Domestic water UZS 2,800/m³ excluding VAT = 3,136 including VAT. Latest applicable local primary schedule located; no 2026 replacement verified. No sewer saving credited for irrigation.'},
    LOAN:{name:'CBU — domestic currency bank lending rates',url:'https://cbu.uz/en/statistics/dks/4854436/',note:'CBU release updated 5 Nov 2026. Used as lending-market context only. Project rates 18%/24%/30% are explicit financing sensitivities, not a bank offer or quoted series value.'},
    BENCH:{name:'TECHNONICOL — Uzbekistan housing market, H1 2026',url:'https://dom.tn.ru/blog/rynok-izhs-uzbekistana-itogi-1-polugodiya-2026-goda/',note:'3 Oct 2026 industry commentary reports approximately USD 700–800/m² construction cost. Individual/low-rise housing focus; scope and area denominator not standardized. Directional cross-check only, not a like-for-like apartment tender.'}
  },
  // id, description, quantity, unit, USD low/expected/high net rates, basis, confidence, sources, quantity/rate build-up
  rows:[
    ['A01','Land / development-right acquisition',2500,'m²',[20,40,100],'E','Low',['QS'],'25 sotka × USD 2,000/4,000/10,000 per sotka. Unvalued peripheral-city allowance, not a comparable sale; no demolition or relocation.'],
    ['A02','Site clearing and strip topsoil',2500,'m²',[0.6,1,1.8],'E','Low',['QS'],'Clean undeveloped plot; stripped soil retained for landscaping.'],
    ['A03','Topographic and cadastral survey',1,'service',[1200,2000,3500],'E','Low',['QS'],'Boundary, levels and utility survey.'],
    ['A04','Geotechnical investigation',4,'boreholes',[600,1000,1800],'E','Low',['QS'],'Assume 4 × 20 m boreholes with laboratory/report allocation; engineer to set depth.'],
    ['A05','Foundation excavation',1100,'m³',[4,6,10],'E','Low',['QS'],'Approximately 700 m² working area × 1.5 m depth plus trenches. No basement.'],
    ['A06','Spoil haulage and lawful disposal',650,'m³',[4,7,12],'E','Low',['QS'],'Balance retained for backfill; assumed short local haul.'],
    ['A07','Selected backfill and compaction',450,'m³',[8,12,18],'E','Low',['QS'],'450 m³ selected fill, labour and compaction; no rock excavation.'],
    ['A08','Water and sewer external connections',1,'allowance',[8000,16000,35000],'E','Low',['QS'],'Boundary to available mains within about 50 m; includes chambers and connection fee allowance.'],
    ['A09','Electricity service and capacity contribution',1,'allowance',[8000,18000,45000],'E','Low',['QS'],'Service cable/connection allowance; high case allows larger capacity contribution. No dedicated new substation design.'],
    ['A10','Gas external service connection',1,'allowance',[3000,6000,14000],'E','Low',['QS'],'Assumes gas available; service trench, meter/regulator allowance. Indoor gas train is C04.'],
    ['A11','Telecom external connection',1,'allowance',[800,1500,3000],'E','Low',['QS'],'Duct to boundary and connection allowance; internal backbone in C14.'],
    ['A12','Access road and service hardstand',250,'m²',[22,30,42],'E','Low',['QS'],'250 m² including fire/service access allowance; base, finish and labour.'],
    ['A13','Permeable parking and aisle',200,'m²',[25,34,48],'E','Low',['QS'],'Six bays plus manoeuvring/transfer space concept allowance. No garage.'],
    ['A14','Boundary fence and gates',200,'lm',[25,40,65],'E','Low',['QS'],'Square-equivalent plot: 4 × 50 m; gates included as averaged rate.'],
    ['A15','Permits, authority review and registration',1,'allowance',[2500,5000,10000],'E','Low',['QS'],'Administrative allowance, not a published fee schedule; design consultant fees are F02.'],
    ['B01','Foundation blinding and granular preparation',600,'m²',[10,15,22],'E','Low',['QS'],'600 m² footprint; 50–75 mm blinding plus compacted layer.'],
    ['B02','Seismic foundations: concrete supply/pump/place',360,'m³',[60,75,100],'A','Low',['CON','QS'],'600 m² × 0.60 m equivalent raft/footing volume. Anchor 600,000 ÷ 1.12 ÷ FX = USD 44.56; balance delivery, pumping, grade allowance and placing.'],
    ['B03','Seismic foundations: reinforcement installed',54,'t',[820,1000,1250],'A','Low',['STEEL','QS'],'360 m³ × 150 kg/m³ = 54 t incl. concept laps/waste. Source net anchor ~USD 705/t; balance certified grade, transport, cutting and fixing.'],
    ['B04','Foundation formwork',750,'m² contact',[13,18,26],'E','Low',['QS'],'Reusable shuttering supply, erection and stripping; no concrete/rebar included.'],
    ['B05','Foundation waterproofing / capillary break',700,'m²',[6,9,14],'E','Low',['QS'],'Footprint plus upstands; no permanent groundwater dewatering assumed.'],
    ['B06','Frame: columns, beams and seismic walls concrete',320,'m³',[65,80,110],'A','Low',['CON','QS'],'0.110 m³ per m² GFA; excludes all slabs and stair concrete. Structural scheme provisional.'],
    ['B07','Frame reinforcement installed',64,'t',[820,1000,1250],'A','Low',['STEEL','QS'],'320 m³ × 200 kg/m³ incl. concept laps/waste; no isolated seismic percentage added again.'],
    ['B08','Frame formwork',3500,'m² contact',[14,20,29],'E','Low',['QS'],'Approximately 11 m² contact/m³ frame concrete; reusable forms and labour.'],
    ['B09','Upper floors and roof slab concrete',580,'m³',[60,75,100],'A','Low',['CON','QS'],'Five suspended slabs × 580 m² average × 0.20 m; roof counted once, ground slab separate.'],
    ['B10','Slab reinforcement installed',69.6,'t',[820,1000,1250],'A','Low',['STEEL','QS'],'580 m³ × 120 kg/m³ incl. laps/waste; structural design may materially change this.'],
    ['B11','Slab soffit / edge formwork',3100,'m² contact',[12,17,25],'E','Low',['QS'],'2,900 m² soffits plus 200 m² edges.'],
    ['B12','Ground-bearing floor slab complete',600,'m²',[25,35,50],'A','Low',['CON','STEEL','QS'],'150 mm RC slab, mesh, placement and DPM; excludes finish screed.'],
    ['B13','Two RC stairs and landings complete',20,'flight equivalents',[650,950,1400],'E','Low',['QS'],'2 stair cores × 5 storeys × 2 flights, including roof access; includes concrete, reinforcement, forms; finish/rails in D14 and D16.'],
    ['B14','Balcony slabs, thermal details and parapets',80,'m²',[75,110,160],'E','Low',['QS'],'40 modest balconies × 2 m²; excludes railings and surface finish.'],
    ['B15','External AAC infill complete',390,'m³',[65,85,115],'A','Medium',['AAC','AAC2','QS'],'1,300 m² net walls × 0.30 m. Source block net ~USD 41.58–57.92/m³ + waste, adhesive, ties, delivery and laying.'],
    ['B16','Internal masonry / AAC partitions',360,'m³',[65,85,115],'A','Low',['AAC','AAC2','QS'],'2,400 m² wall centreline face area × average 0.15 m; acoustic/fire separation sizes to verify.'],
    ['B17','External insulation system, 100 mm',1300,'m²',[16,22,31],'A','Medium',['INS','QS'],'Facade board cost anchor ~USD 6.94 net/m²; adhesive, fixings, mesh/base coat and labour added. Final facade finish in B20.'],
    ['B18','Double-glazed PVC windows installed',350,'m²',[65,85,115],'A','Medium',['WIN','QS'],'Gross facade approx. 1,650 m² minus 350 m² glazing = 1,300 m² insulated walls. Net price allowance includes seals; verify low-E and U-value.'],
    ['B19','External communal entrance doors',4,'sets',[450,650,950],'E','Low',['QS'],'Two entrances with inner/outer doors; apartment doors in D08.'],
    ['B20','Facade finish, plinth and paint',1300,'m²',[9,13,19],'E','Low',['QS'],'Finish coat/paint over B17 base coat. No duplicate insulation or mesh.'],
    ['B21','Roof insulation, falls and waterproofing',600,'m²',[28,38,55],'E','Low',['QS'],'Whole roof: assumed 150 mm insulation, vapour control, falls and membrane. RC roof slab in B09.'],
    ['B22','Roof edges, gutters and downpipes',150,'lm',[15,22,34],'E','Low',['QS'],'Base drainage for full roof, including overflow details; rainwater treatment is C19–22.'],
    ['B23','External horizontal/vertical shading',100,'m² projected',[45,65,95],'E','Low',['QS'],'Approx. 100 openings × 1 m² shade area; durable local fabricated system.'],
    ['B24','Rooftop planting — excluded by revised brief',0,'m²',[30,45,70],'E','Low',['QS'],'Zero quantity: rooftop soil, plants and drainage layers removed. Rates retained only as an optional reference; no cost included. Insulated waterproof roof remains B21.'],
    ['B25','Green roof extra structural load — excluded',0,'m²',[5,10,20],'E','Low',['QS'],'Zero quantity: no allowance for planted-roof loading. PV anchorage remains included.'],
    ['B26','30 kW PV equipment package',1,'system',[8000,9000,11500],'A','Medium',['PV','QS'],'120m UZS ÷ 1.12 ÷ FX ≈ USD 8,911 assumed net; round to USD 9,000. Panels, inverter, BOS and mounting supply assumed in bundle.'],
    ['B27','PV installation, anchoring and commissioning',30,'kWp',[55,85,130],'E','Low',['QS'],'Roof labour, wind/seismic anchoring and electrical tests; equipment not repeated.'],
    ['B28','PV metering / grid connection allowance',1,'allowance',[500,1000,2500],'E','Low',['QS'],'Existing building service in A09; export approval/subsidy not assumed.'],
    ['B29','Elevator shaft, pit and structural coordination',1,'shaft',[7000,11000,18000],'E','Low',['QS'],'One five-stop shaft: provisional incremental pit, RC enclosure, openings, waterproofing and local strengthening beyond generic frame quantities. Supplier pit/headroom dimensions and layout to be coordinated; no second elevator.'],
    ['C01','Gas boiler plant, approx. 2 × 100 kW',2,'boilers',[1800,2600,4000],'E','Low',['QS'],'New quoted equipment needed; 200 kW concept capacity, peak heat loss and DHW duty uncalculated.'],
    ['C02','Boiler room hydraulic fit-out and flue',1,'system',[5000,8000,13000],'E','Low',['QS'],'Pumps, buffer/control, manifold, flue and commissioning; no duplicate boiler supply.'],
    ['C03','Heating distribution and radiators',2900,'m² GFA',[10,14,20],'E','Low',['QS'],'Installed pipework, insulation, valves, radiators and balancing; apartment-level allowance.'],
    ['C04','Indoor gas train and seismic shutoff',1,'system',[1500,2500,4500],'E','Low',['QS'],'Detector, safety valves and indoor connection; engineer to specify.'],
    ['C05','Natural ventilation ducts and trickle vents',40,'apartments',[180,260,400],'E','Low',['QS'],'Stacks, grilles, transfer paths and operable-window detailing; no AC units or mechanical whole-building cooling.'],
    ['C06','Wet-room extract fans and controls',80,'points',[35,55,85],'E','Low',['QS'],'Two extract points/home; natural ventilation is not relied on for wet rooms alone.'],
    ['C07','Cold water distribution and meters',40,'apartments',[350,500,750],'E','Low',['QS'],'Internal risers, branches, shutoffs and individual meter; external connection A08.'],
    ['C08','Hot water distribution and insulation',40,'apartments',[250,400,600],'E','Low',['QS'],'Hot-water circulation/branches; heat generation and solar plant separate.'],
    ['C09','Sewer stacks and branches',40,'apartments',[300,450,650],'E','Low',['QS'],'Internal waste pipes and testing; sanitary fixtures in D11.'],
    ['C10','DHW storage, exchanger and backup controls',1,'system',[3500,5500,9000],'E','Low',['QS'],'Shared storage/exchanger; no unsupported 60% solar-DHW coverage claim.'],
    ['C11','Solar hot-water collectors and loop',20,'m² aperture',[220,320,480],'E','Low',['QS'],'Installed collector loop and freeze protection; central storage already C10. Assumed partial DHW contribution.'],
    ['C12','Apartment wiring, outlets and DBs',2400,'m² net',[10,14,20],'E','Low',['QS'],'Copper wiring, sockets, switches and unit boards; decorative luminaires excluded.'],
    ['C13','Main switchboard, risers, meters, earthing',1,'system',[9000,14000,22000],'E','Low',['QS'],'Main indoor distribution, lightning protection and grounding. PV work B26–28.'],
    ['C14','Telecom/data backbone and door entry',40,'apartments',[90,140,220],'E','Low',['QS'],'Internal low-voltage system; no paid internet service.'],
    ['C15','Common-area LED lighting and sensors',80,'fittings',[25,40,65],'E','Medium',['QS'],'Common circulation, stairs and service rooms only; exterior lighting E10.'],
    ['C16','Fire detection and alarm',1,'system',[4000,6500,11000],'E','Low',['QS'],'Concept detector/alarm system; fire strategy and authority approval required.'],
    ['C17','Emergency lights, signs and extinguishers',5,'floor sets',[350,550,900],'E','Low',['QS'],'Floor-level safety provision; not a certification of code completeness.'],
    ['C18','Fire water / hose provision reserve',1,'allowance',[3000,7000,18000],'E','Low',['QS'],'Provisional internal fire-water allowance; dedicated tank/pump/sprinkler requirement remains a major scope risk.'],
    ['C19','Rainwater tank, 15 m³',1,'tank',[2000,3500,6000],'E','Low',['QS'],'Buried-rated tank or engineered cistern supply; no current supplier quotation found.'],
    ['C20','Tank excavation, base and protection',1,'allowance',[1000,1800,3500],'E','Low',['QS'],'Tank-specific work excluded from A05; includes ballast/protection allowance.'],
    ['C21','Rainwater filters, pump and disinfection',1,'system',[1500,2500,4000],'E','Low',['QS'],'First flush, filter, pump, controls and disinfection for non-potable toilet reuse.'],
    ['C22','Separate non-potable toilet supply',40,'apartments',[150,230,350],'E','Low',['QS'],'Dual labelled pipework and backflow protection; potable system remains C07.'],
    ['C23','Greywater treatment and control plant',1,'system',[5000,9000,15000],'E','Low',['QS'],'Small packaged treatment allowance; irrigation reuse only, design/sampling required.'],
    ['C24','Greywater separation and reuse pipework',40,'apartments',[120,180,280],'E','Low',['QS'],'Showers/basins separate from blackwater; no double counting of rainwater toilet pipework.'],
    ['C25','Integrated MEP testing and handover',1,'allowance',[2000,3500,6000],'E','Low',['QS'],'Final system commissioning and O&M documentation beyond trade tests.'],
    ['C26','Passenger elevator: 630 kg, five stops, MRL',1,'lift',[13000,17000,22000],'A','Low',['LIFT','QS'],'Equipment: cabin, drive, controller, landing doors and automatic rescue allowance. Listing from 165,394,000 / 1.12 / FX ≈ USD 12,282; five-stop/accessible configuration, freight and specification uplift estimated. No duplicate equipment in installation row.'],
    ['C27','Elevator installation, inspection and commissioning',1,'service',[3000,4500,7000],'E','Low',['QS'],'Local erection, testing, certification allowance and first-year service; confirm supplier exclusions.'],
    ['C28','Elevator dedicated supply and safety interfaces',1,'system',[1000,1800,3000],'E','Low',['QS'],'Dedicated isolator/feeder, earthing, alarm interfaces and shaft lighting beyond C13. Rescue system assumed battery-based; whole-building generator excluded.'],
    ['D01','Apartment levelling screed',2400,'m²',[5,7,10],'E','Medium',['QS'],'Net apartment area once; structural slab in B12/B09.'],
    ['D02','Dry-room flooring and skirting',1800,'m²',[10,14,20],'E','Low',['QS'],'75% of net area; economy durable laminate/vinyl, underlay and installation.'],
    ['D03','Kitchen / wet-room floor tiles',600,'m²',[12,17,24],'A','Medium',['TILE','QS'],'25% of net area. 51,000 UZS ÷ 1.12 ÷ FX ≈ USD 3.79 material floor anchor; rate adds waste/adhesive/labour.'],
    ['D04','Wet-room waterproofing',320,'m²',[5,8,12],'E','Low',['QS'],'40 bathrooms × 8 m² floors/returns; water test included.'],
    ['D05','Wall plaster / skim preparation',7200,'m²',[5,7,10],'E','Low',['QS'],'3 × apartment net area, exposed internal wall faces; excludes common areas.'],
    ['D06','Wall paint',6400,'m²',[2,3,4.5],'E','Low',['QS'],'7,200 m² walls less 800 m² bathroom tiles; no double-finish overlap.'],
    ['D07','Ceiling skim and paint',2400,'m²',[5,7,10],'E','Low',['QS'],'Simple flat ceiling, no suspended decorative system.'],
    ['D08','Apartment entrance doors installed',40,'sets',[180,260,380],'E','Low',['QS'],'Acoustic/security allowance; fire rating to follow egress strategy.'],
    ['D09','Internal doors installed',160,'sets',[90,130,190],'E','Low',['QS'],'10 × 3 + 20 × 4 + 10 × 5 doors.'],
    ['D10','Basic kitchen cabinets, worktop and sink',40,'sets',[650,900,1300],'E','Low',['QS'],'One basic set/home; sink/tap included; appliances and loose furniture excluded.'],
    ['D11','Bathroom sanitaryware and fixtures',40,'sets',[500,700,1050],'E','Low',['QS'],'One bathroom/home: WC, basin, shower, taps, trap/accessories installed. Pipework C07–09.'],
    ['D12','Bathroom wall tiles',800,'m²',[12,17,24],'A','Medium',['TILE','QS'],'40 bathrooms × 20 m²; installed rate, substrate plaster in D05.'],
    ['D13','Basic apartment LED fittings',320,'fittings',[8,12,18],'E','Low',['QS'],'Eight basic fittings/home; common lighting in C15.'],
    ['D14','Common-area floor screed and tiles',500,'m²',[18,25,36],'A','Low',['TILE','QS'],'GFA minus net = 500 m² gross common allowance; provisional, includes stairs/landings finish.'],
    ['D15','Common-area wall and ceiling finish',2000,'m²',[6,9,13],'E','Low',['QS'],'Washable paint and substrate preparation to lobbies/stairs.'],
    ['D16','Stair handrails and guards',120,'lm',[25,38,58],'E','Low',['QS'],'Two stair cores, about 60 lm each; structural stairs B13.'],
    ['D17','Balcony rails and floor finish',40,'balconies',[280,400,600],'E','Low',['QS'],'Each 2 m² balcony: guards, waterproof surface finish; slabs B14.'],
    ['D18','Mailboxes, lobby and service-room fittings',1,'allowance',[1500,2500,4500],'E','Low',['QS'],'Modest shared fittings; no concierge or commercial fit-out.'],
    ['E01','Permeable courtyard paving',300,'m²',[22,30,44],'E','Low',['QS'],'Dedicated courtyard; excludes A12 road and A13 parking.'],
    ['E02','Accessible pedestrian paths',250,'m²',[22,30,44],'E','Low',['QS'],'Approx. 125 lm × 2 m wide, including simple ramps.'],
    ['E03','Soil preparation, mulch and drought planting',900,'m²',[5,8,12],'E','Low',['QS'],'Site balance: 600 footprint + 250 road + 200 parking + 300 courtyard + 250 paths + 900 planting = 2,500 m². Tree pits occupy these beds, not extra land.'],
    ['E04','Deciduous shade trees installed',12,'trees',[120,200,350],'E','Low',['QS'],'Local species, pits, staking and establishment allowance.'],
    ['E05','Fruit trees installed',12,'trees',[35,60,100],'E','Low',['QS'],'Young locally suitable stock, not mature imported specimens.'],
    ['E06','Drip irrigation and controller',900,'m² planting',[2,3.5,5.5],'E','Low',['QS'],'Planting beds; treatment/storage in C19–24.'],
    ['E07','Benches and shaded seating',6,'sets',[180,300,500],'E','Low',['QS'],'Local timber/steel or reclaimed timber, anchored and finished.'],
    ['E08','Play space and simple equipment',1,'allowance',[2500,4500,7500],'E','Low',['QS'],'About 56 m² within courtyard, with safe surface and modest equipment.'],
    ['E09','Community raised growing beds',8,'beds',[80,140,220],'E','Low',['QS'],'Within planting area; soil not added twice.'],
    ['E10','Exterior LED bollards',12,'fittings',[70,110,170],'E','Low',['QS'],'Includes local cable run and installation.'],
    ['E11','Planted swale / rain garden',25,'lm',[70,120,190],'E','Low',['QS'],'Strip within 900 m² planting; extra excavation/drainage medium over base planting.'],
    ['E12','Waste sorting and compost point',1,'set',[700,1200,2000],'E','Low',['QS'],'Covered compost/sorting bins and screen.'],
    ['E13','Cycle parking stands',6,'stands',[90,140,220],'E','Low',['QS'],'Up to 12 cycles; paved pad within E02.'],
    ['E14','Simple shade pergola',20,'m²',[70,110,170],'E','Low',['QS'],'Over seating within courtyard; climbing plants included.'],
    ['E15','Wayfinding and sustainability signage',1,'allowance',[300,600,1000],'E','Low',['QS'],'Simple durable information signs.'],
    ['E16','Plant establishment / defects maintenance',1,'year',[1000,1800,3000],'E','Low',['QS'],'First year establishment; routine long-term HOA costs excluded.']
  ]
};

// Assumed net USD/unit for a conventional building of the same size and layout.
const traditionalExpectedRates = {
  A13:28, B17:10, B18:70, B23:0, B26:0, B27:0, B28:0,
  C05:180, C11:0, C19:0, C20:0, C21:0, C22:0, C23:0, C24:0,
  E01:25, E02:25, E03:10, E04:200, E05:0, E06:4.5, E12:600
};
function estimate(scenario=1, options={}) {
  const items=COST.rows.map(r=>({id:r[0],cat:r[0][0],name:r[1],qty:r[2],unit:r[3],rate:r[4][scenario],rates:r[4],basis:r[5],confidence:r[6],sources:r[7],note:r[8],total:r[2]*r[4][scenario]}));
  // Optional scope decisions are all explicit, mutually compatible, and applied before indirects.
  for(const i of items) {
    if(options.traditional && Object.hasOwn(traditionalExpectedRates, i.id)) {
      const scenarioFactor=i.rates[scenario]/i.rates[1];
      i.rate=traditionalExpectedRates[i.id]*scenarioFactor;
      i.basis='E';
      i.sources=['QS'];
      i.note='Traditional specification allowance, scaled by the corresponding trade rate scenario.';
    }
    if(options.land && i.id==='A01') {i.qty=0;i.note+=' Publicly provided land: zero cash acquisition; economic value excluded.';}
    if(options.grey && ['C23','C24'].includes(i.id)) i.qty=0;
    if(options.solarhot && i.id==='C11') i.qty=0;
    if(options.rain && i.id==='C22') i.qty=0;
    if(options.rain && i.id==='C21') {i.rate=[900,1500,2400][scenario];i.note+=' Irrigation-only filter/pump; toilet disinfection omitted.';}
    i.total=i.qty*i.rate;
  }
  const sum=(pred)=>items.filter(pred).reduce((a,r)=>a+r.total,0);
  const direct=sum(()=>true), land=sum(r=>r.id==='A01'), permits=sum(r=>r.id==='A15');
  const works=direct-land-permits;
  function add(id,name,total,formula,source=['QS'],confidence='Low') {
    items.push({id,cat:'F',name,qty:1,unit:'allowance',rate:total,total,basis:'E',confidence,sources:source,note:formula});
  }
  const cmRate=[.04,.05,.06][scenario], designRate=[.025,.035,.05][scenario];
  const cm=works*cmRate, design=works*designRate;
  add('F01','Site management, preliminaries and shared plant',cm,`${cmRate*100}% × works excluding land/permits. Site staff, fencing during works, temporary services, shared crane/scaffold, security and welfare. Trade labour/profit already in A–E.`);
  add('F02','Design, engineering, QS and supervision',design,`${designRate*100}% × works excluding land/permits; architecture, structural/seismic, MEP and site design. Surveys A03–04 excluded from this fee.`);
  const ins=works*[.003,.005,.008][scenario];
  add('F03','Construction insurance',ins,`${[.3,.5,.8][scenario]}% × works excluding land/permits; provisional premium, no VAT added in this model.`);
  const riskRate=[.10,.15,.20][scenario], riskBase=works+cm+design, risk=riskBase*riskRate;
  add('F04','Design development and construction contingency',risk,`${riskRate*100}% × (works + site management + design). Expected 15% reflects unmeasured structural quantities, unknown soil/services and unquoted specialist systems; excludes land, financing and inflation.`);
  const escRate=[0,.04,.08][scenario], escalation=(works+cm)*escRate;
  add('F05','Procurement / construction price escalation',escalation,`${escRate*100}% × (works + site management). Explicit forward allowance for a 12–18 month delivery; not a sourced inflation forecast. Separate from design contingency.`);
  const taxBase=works+cm+design+risk+escalation, vat=taxBase*.12;
  add('F06','Unrecoverable VAT cash provision',vat,`12% × taxable base USD ${taxBase.toFixed(2)} = works + management + design + taxable contingency + escalation. Net A–E rates; VAT added once. Land, statutory permit allowance, insurance, holding tax and interest excluded.`,['VAT','QS']);
  const holding=[1000,2000,5000][scenario];
  add('F07','Land/property holding taxes and local charges',holding,'Provisional construction-period allowance; cadastral value/status not supplied. Payroll/social taxes included in labour; corporate income tax and sales marketing excluded from development cost.');
  const beforeFinance=items.reduce((a,r)=>a+r.total,0), debt=[.4,.6,.7][scenario], interest=[.18,.24,.30][scenario], years=[1,1.25,1.5][scenario];
  const finance=options.equity?0:beforeFinance*debt*.5*interest*years;
  add('F08','Construction finance interest',finance,options.equity?'100% equity cash scenario; no loan interest. Equity opportunity cost is not priced.':`${beforeFinance.toFixed(2)} × ${debt*100}% debt × 50% average utilization × ${interest*100}% annual interest × ${years} years. Linear drawdown approximation; no compounding/presale offset.`,['LOAN','QS']);
  const fee=options.equity?0:beforeFinance*debt*[.005,.01,.015][scenario];
  add('F09','Loan arrangement fee',fee,options.equity?'No debt assumed.':`${beforeFinance.toFixed(2)} × ${debt*100}% debt × ${[.5,1,1.5][scenario]}% arrangement fee. Not a lender quote.`,['LOAN','QS']);
  return {items,direct,works,land,vat,finance:finance+fee,total:items.reduce((a,r)=>a+r.total,0),beforeFinance};
}
if(typeof module!=='undefined') module.exports={COST,estimate};
