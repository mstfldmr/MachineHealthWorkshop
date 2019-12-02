/*global require,setInterval,console */
const opcua = require("node-opcua");
const fs = require('fs');

const input_data = {
  "input": [
    [
      [1.0, 0.6562714576721191, 0.6925442218780518, 1.0, 1.0, 0.5962146520614624, 0.42196834087371826, 0.28221362829208374, 1.0, 1.0, 0.6088710427284241, 0.36585521697998047, 0.1964751034975052, 1.0, 0.27397310733795166, 0.5342466831207275, 0.32558295130729675, 0.15225933492183685, 0.3470788598060608, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5000004768371582, 0.6200996041297913],
      [2.0, 0.34379100799560547, 0.23136049509048462, 1.0, 1.0, 0.18296556174755096, 0.5040249228477478, 0.22523996233940125, 1.0, 1.0, 0.8004032373428345, 0.2926846444606781, 0.2290421575307846, 1.0, 0.4794524013996124, 0.6347032785415649, 0.39535024762153625, 0.27790677547454834, 0.2277122288942337, 1.0, 0.5000000596046448, 1.0, 1.0, 0.6454548835754395, 0.6457188129425049],
      [3.0, 0.5312792658805847, 0.5388162732124329, 1.0, 1.0, 0.4195585548877716, 0.46481433510780334, 0.3461303114891052, 1.0, 1.0, 0.6512097716331482, 0.39024537801742554, 0.24850575625896454, 1.0, 0.4794524013996124, 0.5913242697715759, 0.32558295130729675, 0.19289159774780273, 0.533559262752533, 1.0, 0.5000000596046448, 1.0, 1.0, 0.7000002861022949, 0.6811044812202454],
      [4.0, 0.7750140428543091, 0.4619523584842682, 1.0, 1.0, 0.4132494032382965, 0.39158663153648376, 0.44986727833747864, 1.0, 1.0, 0.6431452035903931, 0.341465026140213, 0.15908046066761017, 1.0, 0.3287675976753235, 0.4566211402416229, 0.3720944821834564, 0.21789605915546417, 0.2823620140552521, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6272730827331543, 0.6203827261924744],
      [5.0, 0.6000249981880188, 0.4619523584842682, 1.0, 1.0, 0.43533140420913696, 0.471306174993515, 0.3579742908477783, 1.0, 1.0, 0.6612904071807861, 0.2926846444606781, 0.15340997278690338, 1.0, 0.3493155241012573, 0.6324201822280884, 0.32558295130729675, 0.18789070844650269, 0.33701181411743164, 1.0, 0.12500010430812836, 1.0, 1.0, 0.6181821823120117, 0.676008939743042],
      [6.0, 0.5875257849693298, 0.6925442218780518, 1.0, 1.0, 0.30914849042892456, 0.2617502212524414, 0.2193179726600647, 1.0, 1.0, 0.6733871698379517, 0.26829445362091064, 0.20252874493598938, 1.0, 0.31506896018981934, 0.5799087882041931, 0.44186174869537354, 0.16931596398353577, 0.43624430894851685, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5454549789428711, 0.5821661949157715],
      [7.0, 0.5125304460525513, 0.6156802177429199, 1.0, 1.0, 0.30914849042892456, 0.3713321387767792, 0.41760262846946716, 1.0, 1.0, 0.6068549156188965, 0.39024537801742554, 0.20582376420497894, 1.0, 0.3493155241012573, 0.600456714630127, 0.39535024762153625, 0.23638150095939636, 0.28092387318611145, 1.0, 0.25000008940696716, 1.0, 1.0, 0.49090954661369324, 0.6508143544197083],
      [8.0, 0.5500281453132629, 0.4619523584842682, 1.0, 1.0, 0.4447951316833496, 0.30771228671073914, 0.3369410037994385, 1.0, 1.0, 0.5463710427284241, 0.39024537801742554, 0.21708813309669495, 1.0, 0.28082239627838135, 0.6187215447425842, 0.39535024762153625, 0.15565280616283417, 0.4242597222328186, 1.0, 0.5000000596046448, 1.0, 1.0, 0.6727275848388672, 0.5477713346481323],
      [9.0, 0.28754451870918274, 0.4619523584842682, 1.0, 1.0, 0.2365933060646057, 0.6297065615653992, 0.5695323944091797, 1.0, 1.0, 0.7278226613998413, 0.414635568857193, 0.18406130373477936, 1.0, 0.390411376953125, 0.6050229072570801, 0.3720944821834564, 0.22905877232551575, 0.4913734793663025, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7181820869445801, 0.7313520908355713],
      [10.0, 0.35629022121429443, 0.38508838415145874, 1.0, 1.0, 0.29653018712997437, 0.4209296405315399, 0.2909944951534271, 1.0, 1.0, 0.6854839324951172, 0.36585521697998047, 0.2101149559020996, 1.0, 0.2328772395849228, 0.5981736183166504, 0.39535024762153625, 0.22843365371227264, 0.3667336106300354, 1.0, 0.25000008940696716, 1.0, 1.0, 0.5090913772583008, 0.6321307420730591],
      [11.0, 0.5562777519226074, 0.15449653565883636, 1.0, 1.0, 0.2870664596557617, 0.31134772300720215, 0.3969777524471283, 1.0, 1.0, 0.7681452035903931, 0.36585521697998047, 0.20796935260295868, 1.0, 0.2945210337638855, 0.5867580771446228, 0.39535024762153625, 0.21325238049030304, 0.2833207845687866, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6818184852600098, 0.6022652387619019],
      [12.0, 0.6750203371047974, 0.6925442218780518, 1.0, 1.0, 0.4447951316833496, 0.4775383174419403, 0.2742495536804199, 1.0, 1.0, 0.6995968222618103, 0.31707483530044556, 0.19532567262649536, 1.0, 0.3219182789325714, 0.600456714630127, 0.39535024762153625, 0.2128058671951294, 0.3144807517528534, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7272729873657227, 0.6356692910194397],
      [13.0, 0.1625523418188095, 0.6925442218780518, 1.0, 1.0, 0.2555207312107086, 0.5206440091133118, 0.39922401309013367, 1.0, 1.0, 0.6370968222618103, 0.31707483530044556, 0.16199234127998352, 1.0, 0.37671276926994324, 0.6826484799385071, 0.32558295130729675, 0.20200036466121674, 0.40172865986824036, 1.0, 0.37500008940696716, 1.0, 1.0, 0.7000002861022949, 0.6118901371955872],
      [14.0, 0.6187738180160522, 0.15449653565883636, 1.0, 1.0, 0.34700337052345276, 0.3666580319404602, 0.37757810950279236, 1.0, 1.0, 0.7620968222618103, 0.341465026140213, 0.15915709733963013, 1.0, 0.3013703525066376, 0.5867580771446228, 0.39535024762153625, 0.19467762112617493, 0.4626104235649109, 1.0, 0.37500008940696716, 1.0, 1.0, 0.654545783996582, 0.7385708093643188],
      [15.0, 0.4937816262245178, 0.23136049509048462, 1.0, 1.0, 0.4321768283843994, 0.4095040261745453, 0.29405760765075684, 1.0, 1.0, 0.6592742800712585, 0.26829445362091064, 0.21501916646957397, 1.0, 0.37671276926994324, 0.4566211402416229, 0.25581568479537964, 0.2243257761001587, 0.40029051899909973, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6636366844177246, 0.611182451248169],
      [16.0, 0.4000374972820282, 0.6925442218780518, 1.0, 1.0, 0.3753945231437683, 0.40171384811401367, 0.477230966091156, 1.0, 1.0, 0.5927420258522034, 0.5121963024139404, 0.13340996205806732, 1.0, 0.40410998463630676, 0.6347032785415649, 0.4883732795715332, 0.2262011170387268, 0.465966135263443, 1.0, 0.12500010430812836, 1.0, 1.0, 0.5090913772583008, 0.584572434425354],
      [17.0, 0.6000249981880188, 0.6156802177429199, 1.0, 1.0, 0.33438506722450256, 0.3547130823135376, 0.40289974212646484, 1.0, 1.0, 0.7137097120285034, 0.414635568857193, 0.16337165236473083, 1.0, 0.3219182789325714, 0.6187215447425842, 0.3023272156715393, 0.16324344277381897, 0.5987555384635925, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7090911865234375, 0.5739567279815674],
      [18.0, 0.7312667965888977, 0.5388162732124329, 1.0, 1.0, 0.46056798100471497, 0.45416775345802307, 0.39411887526512146, 1.0, 1.0, 0.5282258987426758, 0.36585521697998047, 0.1807662844657898, 1.0, 0.43835654854774475, 0.6301370859146118, 0.39535024762153625, 0.2207537144422531, 0.4769919514656067, 1.0, 0.25000008940696716, 1.0, 1.0, 0.590909481048584, 0.7256904244422913],
      [19.0, 0.6937691569328308, 0.5388162732124329, 1.0, 1.0, 0.41009482741355896, 0.4294988512992859, 0.36573413014411926, 1.0, 1.0, 0.6028226613998413, 0.2926846444606781, 0.17141762375831604, 1.0, 0.30821964144706726, 0.6118722558021545, 0.2790714502334595, 0.1858367621898651, 0.27037742733955383, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6818184852600098, 0.6305737495422363],
      [20.0, 0.5812761783599854, 0.38508838415145874, 1.0, 1.0, 0.46687713265419006, 0.48662686347961426, 0.3330610692501068, 1.0, 1.0, 0.6915323138237, 0.39024537801742554, 0.12712644040584564, 1.0, 0.4520551562309265, 0.6621005535125732, 0.3720944821834564, 0.1794070452451706, 0.36960992217063904, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6272730827331543, 0.5620671510696411],
      [21.0, 0.7500156164169312, 0.3082244396209717, 1.0, 1.0, 0.4952682852745056, 0.37029343843460083, 0.30243006348609924, 1.0, 1.0, 0.7137097120285034, 0.39024537801742554, 0.22375479340553284, 1.0, 0.3835620582103729, 0.609589159488678, 0.511629045009613, 0.1639578640460968, 0.40556374192237854, 1.0, 0.37500008940696716, 1.0, 1.0, 0.590909481048584, 0.6611469984054565],
      [22.0, 0.5875257849693298, 0.5388162732124329, 1.0, 1.0, 0.41640397906303406, 0.3567904531955719, 0.4016745090484619, 1.0, 1.0, 0.5141130089759827, 0.26829445362091064, 0.16796936094760895, 1.0, 0.31506896018981934, 0.4634704291820526, 0.3488387167453766, 0.18208609521389008, 0.5891678333282471, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5727276802062988, 0.6250535845756531],
      [23.0, 0.5687769651412964, 0.4619523584842682, 1.0, 1.0, 0.3123030662536621, 0.4796156883239746, 0.21850113570690155, 1.0, 1.0, 0.8447580933570862, 0.36585521697998047, 0.2109578549861908, 1.0, 0.2671237885951996, 0.5981736183166504, 0.39535024762153625, 0.200660839676857, 0.3777594566345215, 1.0, 0.5000000596046448, 1.0, 1.0, 0.7181820869445801, 0.5423927307128906],
      [24.0, 0.4750328063964844, 0.38508838415145874, 1.0, 1.0, 0.3753945231437683, 0.6556738615036011, 0.3218297064304352, 1.0, 1.0, 0.48185494542121887, 0.43902575969696045, 0.14398467540740967, 1.0, 0.3356168866157532, 0.6118722558021545, 0.5348848104476929, 0.1982496976852417, 0.3576253354549408, 1.0, 0.5000000596046448, 1.0, 1.0, 0.5727276802062988, 0.6535036563873291],
      [25.0, 0.6875195503234863, 0.23136049509048462, 1.0, 1.0, 0.35331249237060547, 0.34770190715789795, 0.3234633505344391, 1.0, 1.0, 0.5806452631950378, 0.5365865230560303, 0.14766284823417664, 1.0, 0.390411376953125, 0.6575343012809753, 0.44186174869537354, 0.17994286119937897, 0.3255065977573395, 1.0, 0.5000000596046448, 1.0, 1.0, 0.590909481048584, 0.6271767616271973],
      [26.0, 0.8062621355056763, 0.0776325911283493, 1.0, 1.0, 0.4258676767349243, 0.36977410316467285, 0.48356136679649353, 1.0, 1.0, 0.7479839324951172, 0.4634159505367279, 0.22145594656467438, 1.0, 0.3630141317844391, 0.5867580771446228, 0.4186060130596161, 0.18414002656936646, 0.2977023124694824, 1.0, 0.25000008940696716, 1.0, 1.0, 0.4181823432445526, 0.5949050188064575],
      [27.0, 0.4687831997871399, 0.5388162732124329, 1.0, 1.0, 0.2996847629547119, 0.4572838246822357, 0.3250970244407654, 1.0, 1.0, 0.6995968222618103, 0.48780614137649536, 0.16528736054897308, 1.0, 0.36986345052719116, 0.5570777058601379, 0.3023272156715393, 0.16735132038593292, 0.5589666366577148, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5090913772583008, 0.6478419899940491],
      [28.0, 0.6500218510627747, 0.8462721109390259, 1.0, 1.0, 0.25236615538597107, 0.6546351909637451, 0.3451092541217804, 1.0, 1.0, 0.5403226613998413, 0.43902575969696045, 0.23777778446674347, 1.0, 0.17123344540596008, 0.5616439580917358, 0.4186060130596161, 0.23566709458827972, 0.5474614500999451, 1.0, 0.37500008940696716, 1.0, 1.0, 0.4727277457714081, 0.5871201753616333],
      [29.0, 0.6000249981880188, 0.5388162732124329, 1.0, 1.0, 0.25867530703544617, 0.47026747465133667, 0.28017154335975647, 1.0, 1.0, 0.6592742800712585, 0.4634159505367279, 0.16536399722099304, 1.0, 0.424657940864563, 0.6872146725654602, 0.4186060130596161, 0.21995000541210175, 0.42378032207489014, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6454548835754395, 0.6039637327194214],
      [30.0, 0.35629022121429443, 0.7694081664085388, 1.0, 1.0, 0.5236594676971436, 0.4331342577934265, 0.3385746479034424, 1.0, 1.0, 0.6491936445236206, 0.48780614137649536, 0.17563219368457794, 1.0, 0.41095930337905884, 0.5479453206062317, 0.4883732795715332, 0.23477406799793243, 0.37488314509391785, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7090911865234375, 0.667374849319458]
    ]
  ],

  "fail": [
    [
      [1.0, 0.6562714576721191, 0.6925442218780518, 1.0, 1.0, 0.5962146520614624, 0.42196834087371826, 0.28221362829208374, 1.0, 1.0, 0.6088710427284241, 0.36585521697998047, 0.1964751034975052, 1.0, 0.27397310733795166, 0.5342466831207275, 0.32558295130729675, 0.15225933492183685, 0.3470788598060608, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5000004768371582, 0.6200996041297913],
      [2.0, 0.34379100799560547, 0.23136049509048462, 1.0, 1.0, 0.18296556174755096, 0.5040249228477478, 0.22523996233940125, 1.0, 1.0, 0.8004032373428345, 0.2926846444606781, 0.2290421575307846, 1.0, 0.4794524013996124, 0.6347032785415649, 0.39535024762153625, 0.27790677547454834, 0.2277122288942337, 1.0, 0.5000000596046448, 1.0, 1.0, 0.6454548835754395, 0.6457188129425049],
      [3.0, 0.5312792658805847, 0.5388162732124329, 1.0, 1.0, 0.4195585548877716, 0.46481433510780334, 0.3461303114891052, 1.0, 1.0, 0.6512097716331482, 0.39024537801742554, 0.24850575625896454, 1.0, 0.4794524013996124, 0.5913242697715759, 0.32558295130729675, 0.19289159774780273, 0.533559262752533, 1.0, 0.5000000596046448, 1.0, 1.0, 0.7000002861022949, 0.6811044812202454],
      [4.0, 0.7750140428543091, 0.4619523584842682, 1.0, 1.0, 0.4132494032382965, 0.39158663153648376, 0.44986727833747864, 1.0, 1.0, 0.6431452035903931, 0.341465026140213, 0.15908046066761017, 1.0, 0.3287675976753235, 0.4566211402416229, 0.3720944821834564, 0.21789605915546417, 0.2823620140552521, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6272730827331543, 0.6203827261924744],
      [5.0, 0.6000249981880188, 0.4619523584842682, 1.0, 1.0, 0.43533140420913696, 0.471306174993515, 0.3579742908477783, 1.0, 1.0, 0.6612904071807861, 0.2926846444606781, 0.15340997278690338, 1.0, 0.3493155241012573, 0.6324201822280884, 0.32558295130729675, 0.18789070844650269, 0.33701181411743164, 1.0, 0.12500010430812836, 1.0, 1.0, 0.6181821823120117, 0.676008939743042],
      [6.0, 0.5875257849693298, 0.6925442218780518, 1.0, 1.0, 0.30914849042892456, 0.2617502212524414, 0.2193179726600647, 1.0, 1.0, 0.6733871698379517, 0.26829445362091064, 0.20252874493598938, 1.0, 0.31506896018981934, 0.5799087882041931, 0.44186174869537354, 0.16931596398353577, 0.43624430894851685, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5454549789428711, 0.5821661949157715],
      [7.0, 0.5125304460525513, 0.6156802177429199, 1.0, 1.0, 0.30914849042892456, 0.3713321387767792, 0.41760262846946716, 1.0, 1.0, 0.6068549156188965, 0.39024537801742554, 0.20582376420497894, 1.0, 0.3493155241012573, 0.600456714630127, 0.39535024762153625, 0.23638150095939636, 0.28092387318611145, 1.0, 0.25000008940696716, 1.0, 1.0, 0.49090954661369324, 0.6508143544197083],
      [8.0, 0.5500281453132629, 0.4619523584842682, 1.0, 1.0, 0.4447951316833496, 0.30771228671073914, 0.3369410037994385, 1.0, 1.0, 0.5463710427284241, 0.39024537801742554, 0.21708813309669495, 1.0, 0.28082239627838135, 0.6187215447425842, 0.39535024762153625, 0.15565280616283417, 0.4242597222328186, 1.0, 0.5000000596046448, 1.0, 1.0, 0.6727275848388672, 0.5477713346481323],
      [9.0, 0.28754451870918274, 0.4619523584842682, 1.0, 1.0, 0.2365933060646057, 0.6297065615653992, 0.5695323944091797, 1.0, 1.0, 0.7278226613998413, 0.414635568857193, 0.18406130373477936, 1.0, 0.390411376953125, 0.6050229072570801, 0.3720944821834564, 0.22905877232551575, 0.4913734793663025, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7181820869445801, 0.7313520908355713],
      [10.0, 0.35629022121429443, 0.38508838415145874, 1.0, 1.0, 0.29653018712997437, 0.4209296405315399, 0.2909944951534271, 1.0, 1.0, 0.6854839324951172, 0.36585521697998047, 0.2101149559020996, 1.0, 0.2328772395849228, 0.5981736183166504, 0.39535024762153625, 0.22843365371227264, 0.3667336106300354, 1.0, 0.25000008940696716, 1.0, 1.0, 0.5090913772583008, 0.6321307420730591],
      [11.0, 0.5562777519226074, 0.15449653565883636, 1.0, 1.0, 0.2870664596557617, 0.31134772300720215, 0.3969777524471283, 1.0, 1.0, 0.7681452035903931, 0.36585521697998047, 0.20796935260295868, 1.0, 0.2945210337638855, 0.5867580771446228, 0.39535024762153625, 0.21325238049030304, 0.2833207845687866, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6818184852600098, 0.6022652387619019],
      [12.0, 0.6750203371047974, 0.6925442218780518, 1.0, 1.0, 0.4447951316833496, 0.4775383174419403, 0.2742495536804199, 1.0, 1.0, 0.6995968222618103, 0.31707483530044556, 0.19532567262649536, 1.0, 0.3219182789325714, 0.600456714630127, 0.39535024762153625, 0.2128058671951294, 0.3144807517528534, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7272729873657227, 0.6356692910194397],
      [13.0, 0.1625523418188095, 0.6925442218780518, 1.0, 1.0, 0.2555207312107086, 0.5206440091133118, 0.39922401309013367, 1.0, 1.0, 0.6370968222618103, 0.31707483530044556, 0.16199234127998352, 1.0, 0.37671276926994324, 0.6826484799385071, 0.32558295130729675, 0.20200036466121674, 0.40172865986824036, 1.0, 0.37500008940696716, 1.0, 1.0, 0.7000002861022949, 0.6118901371955872],
      [14.0, 0.6187738180160522, 0.15449653565883636, 1.0, 1.0, 0.34700337052345276, 0.3666580319404602, 0.37757810950279236, 1.0, 1.0, 0.7620968222618103, 0.341465026140213, 0.15915709733963013, 1.0, 0.3013703525066376, 0.5867580771446228, 0.39535024762153625, 0.19467762112617493, 0.4626104235649109, 1.0, 0.37500008940696716, 1.0, 1.0, 0.654545783996582, 0.7385708093643188],
      [15.0, 0.4937816262245178, 0.23136049509048462, 1.0, 1.0, 0.4321768283843994, 0.4095040261745453, 0.29405760765075684, 1.0, 1.0, 0.6592742800712585, 0.26829445362091064, 0.21501916646957397, 1.0, 0.37671276926994324, 0.4566211402416229, 0.25581568479537964, 0.2243257761001587, 0.40029051899909973, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6636366844177246, 0.611182451248169],
      [16.0, 0.4000374972820282, 0.6925442218780518, 1.0, 1.0, 0.3753945231437683, 0.40171384811401367, 0.477230966091156, 1.0, 1.0, 0.5927420258522034, 0.5121963024139404, 0.13340996205806732, 1.0, 0.40410998463630676, 0.6347032785415649, 0.4883732795715332, 0.2262011170387268, 0.465966135263443, 1.0, 0.12500010430812836, 1.0, 1.0, 0.5090913772583008, 0.584572434425354],
      [17.0, 0.6000249981880188, 0.6156802177429199, 1.0, 1.0, 0.33438506722450256, 0.3547130823135376, 0.40289974212646484, 1.0, 1.0, 0.7137097120285034, 0.414635568857193, 0.16337165236473083, 1.0, 0.3219182789325714, 0.6187215447425842, 0.3023272156715393, 0.16324344277381897, 0.5987555384635925, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7090911865234375, 0.5739567279815674],
      [18.0, 0.7312667965888977, 0.5388162732124329, 1.0, 1.0, 0.46056798100471497, 0.45416775345802307, 0.39411887526512146, 1.0, 1.0, 0.5282258987426758, 0.36585521697998047, 0.1807662844657898, 1.0, 0.43835654854774475, 0.6301370859146118, 0.39535024762153625, 0.2207537144422531, 0.4769919514656067, 1.0, 0.25000008940696716, 1.0, 1.0, 0.590909481048584, 0.7256904244422913],
      [19.0, 0.6937691569328308, 0.5388162732124329, 1.0, 1.0, 0.41009482741355896, 0.4294988512992859, 0.36573413014411926, 1.0, 1.0, 0.6028226613998413, 0.2926846444606781, 0.17141762375831604, 1.0, 0.30821964144706726, 0.6118722558021545, 0.2790714502334595, 0.1858367621898651, 0.27037742733955383, 1.0, 0.25000008940696716, 1.0, 1.0, 0.6818184852600098, 0.6305737495422363],
      [20.0, 0.5812761783599854, 0.38508838415145874, 1.0, 1.0, 0.46687713265419006, 0.48662686347961426, 0.3330610692501068, 1.0, 1.0, 0.6915323138237, 0.39024537801742554, 0.12712644040584564, 1.0, 0.4520551562309265, 0.6621005535125732, 0.3720944821834564, 0.1794070452451706, 0.36960992217063904, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6272730827331543, 0.5620671510696411],
      [21.0, 0.7500156164169312, 0.3082244396209717, 1.0, 1.0, 0.4952682852745056, 0.37029343843460083, 0.30243006348609924, 1.0, 1.0, 0.7137097120285034, 0.39024537801742554, 0.22375479340553284, 1.0, 0.3835620582103729, 0.609589159488678, 0.511629045009613, 0.1639578640460968, 0.40556374192237854, 1.0, 0.37500008940696716, 1.0, 1.0, 0.590909481048584, 0.6611469984054565],
      [22.0, 0.5875257849693298, 0.5388162732124329, 1.0, 1.0, 0.41640397906303406, 0.3567904531955719, 0.4016745090484619, 1.0, 1.0, 0.5141130089759827, 0.26829445362091064, 0.16796936094760895, 1.0, 0.31506896018981934, 0.4634704291820526, 0.3488387167453766, 0.18208609521389008, 0.5891678333282471, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5727276802062988, 0.6250535845756531],
      [23.0, 0.5687769651412964, 0.4619523584842682, 1.0, 1.0, 0.3123030662536621, 0.4796156883239746, 0.21850113570690155, 1.0, 1.0, 0.8447580933570862, 0.36585521697998047, 0.2109578549861908, 1.0, 0.2671237885951996, 0.5981736183166504, 0.39535024762153625, 0.200660839676857, 0.3777594566345215, 1.0, 0.5000000596046448, 1.0, 1.0, 0.7181820869445801, 0.5423927307128906],
      [24.0, 0.4750328063964844, 0.38508838415145874, 1.0, 1.0, 0.3753945231437683, 0.6556738615036011, 0.3218297064304352, 1.0, 1.0, 0.48185494542121887, 0.43902575969696045, 0.14398467540740967, 1.0, 0.3356168866157532, 0.6118722558021545, 0.5348848104476929, 0.1982496976852417, 0.3576253354549408, 1.0, 0.5000000596046448, 1.0, 1.0, 0.5727276802062988, 0.6535036563873291],
      [25.0, 0.6875195503234863, 0.23136049509048462, 1.0, 1.0, 0.35331249237060547, 0.34770190715789795, 0.3234633505344391, 1.0, 1.0, 0.5806452631950378, 0.5365865230560303, 0.14766284823417664, 1.0, 0.390411376953125, 0.6575343012809753, 0.44186174869537354, 0.17994286119937897, 0.3255065977573395, 1.0, 0.5000000596046448, 1.0, 1.0, 0.590909481048584, 0.6271767616271973],
      [26.0, 0.8062621355056763, 0.0776325911283493, 1.0, 1.0, 0.4258676767349243, 0.36977410316467285, 0.48356136679649353, 1.0, 1.0, 0.7479839324951172, 0.4634159505367279, 0.22145594656467438, 1.0, 0.3630141317844391, 0.5867580771446228, 0.4186060130596161, 0.18414002656936646, 0.2977023124694824, 1.0, 0.25000008940696716, 1.0, 1.0, 0.4181823432445526, 0.5949050188064575],
      [27.0, 0.4687831997871399, 0.5388162732124329, 1.0, 1.0, 0.2996847629547119, 0.4572838246822357, 0.3250970244407654, 1.0, 1.0, 0.6995968222618103, 0.48780614137649536, 0.16528736054897308, 1.0, 0.36986345052719116, 0.5570777058601379, 0.3023272156715393, 0.16735132038593292, 0.5589666366577148, 1.0, 0.37500008940696716, 1.0, 1.0, 0.5090913772583008, 0.6478419899940491],
      [28.0, 0.6500218510627747, 0.8462721109390259, 1.0, 1.0, 0.25236615538597107, 0.6546351909637451, 0.3451092541217804, 1.0, 1.0, 0.5403226613998413, 0.43902575969696045, 0.23777778446674347, 1.0, 0.17123344540596008, 0.5616439580917358, 0.4186060130596161, 0.23566709458827972, 0.5474614500999451, 1.0, 0.37500008940696716, 1.0, 1.0, 0.4727277457714081, 0.5871201753616333],
      [29.0, 0.6000249981880188, 0.5388162732124329, 1.0, 1.0, 0.25867530703544617, 0.47026747465133667, 0.28017154335975647, 1.0, 1.0, 0.6592742800712585, 0.4634159505367279, 0.16536399722099304, 1.0, 0.424657940864563, 0.6872146725654602, 0.4186060130596161, 0.21995000541210175, 0.42378032207489014, 1.0, 0.37500008940696716, 1.0, 1.0, 0.6454548835754395, 0.6039637327194214],
      [30.0, 0.35629022121429443, 0.7694081664085388, 1.0, 1.0, 0.5236594676971436, 0.4331342577934265, 0.3385746479034424, 1.0, 1.0, 0.6491936445236206, 0.48780614137649536, 0.17563219368457794, 1.0, 0.41095930337905884, 0.5479453206062317, 0.4883732795715332, 0.23477406799793243, 0.37488314509391785, 1.0, 0.25000008940696716, 1.0, 1.0, 0.7090911865234375, 0.667374849319458]
    ]
  ]
};

// Let's create an instance of OPCUAServer
const server = new opcua.OPCUAServer({
    port: 4334, // the port of the listening socket of the server
    resourcePath: "/UA/Turbofan", // this path will be added to the endpoint resource name
     buildInfo : {
        productName: "Turbofan",
        buildNumber: "7658",
        buildDate: new Date(2019,11,30)
    }
});

function post_initialize() {
    console.log("initialized");
    function construct_my_address_space(server) {

        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // declare a new object
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "TurbofanLeft"
        });

        // add some variables
        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let counter = 1;

        // emulate variable1 changing every 500 ms
        setInterval(function(){
          counter+=1;
        }, 1000);

        namespace.addVariable({
            componentOf: device,
            browseName: "Counter",
            dataType: "Double",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: counter });
                }
            }
        });


        function get_combined() {
          fs.exists('fail.txt', function(exists){
            if(exists){
              //TODO: return random data
              return combined = input_data['fail'][0][counter2].toString();
            } else{
              return combined = input_data['input'][0][counter2].toString();
            }
          });
        }

        let counter2 = 0;
        setInterval(function(){
          counter2 = (counter2 + 1) % input_data['input'][0].length;
        }, 3000);

        namespace.addVariable({
            componentOf: device,
            browseName: "Combined",
            dataType: "String",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.String, value: get_combined() });
                }
            }
        });

        // add a variable named MyVariable2 to the newly created folder "MyDevice"
        let variable2 = 26.34;
        namespace.addVariable({
            componentOf: device,
            nodeId: "ns=1;b=1020FFAA", // some opaque NodeId in namespace 4
            browseName: "MyVariable2",
            dataType: "Double",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: variable2 });
                },
                set: function (variant) {
                    variable2 = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });

        const os = require("os");
        /**
         * returns the percentage of free memory on the running machine
         * @return {double}
         */
        function available_memory() {
            // var value = process.memoryUsage().heapUsed / 1000000;
            const percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
            return percentageMemUsed;
        }
        namespace.addVariable({
            componentOf: device,
            nodeId: "s=free_memory", // a string nodeID
            browseName: "FreeMemory",
            dataType: "Double",
            value: {
                get: function () {return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory() });}
            }
        });


        // declare a new object
        const device2 = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "TurbofanRight"
        });

        let variable21 = "Good";
        let i = 0;
        setInterval(function(){
          if(i%2){
            variable21 = "Bad";
          } else {
            variable21 = "Good";
          }
          i++;
        }, 1500);
        namespace.addVariable({
            componentOf: device2,
            browseName: "Status",
            dataType: "String",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.String, value: variable21 });
                }
            }
        });

    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}
server.initialize(post_initialize);
