"""Hand-authored SVG scenes for the Vlog Studio demonstration.

Every scene is a synthetic editorial illustration. The script uses only Python's
standard library; Inkscape and FFmpeg are optional local rendering tools.
"""
from pathlib import Path
import subprocess
import math

ROOT = Path(__file__).resolve().parent


def svg(body, defs='', width=720, height=1280):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">
<title>Synthetic India travel editorial illustration</title>
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ECE2CB"/><stop offset="1" stop-color="#F8D4A6"/></linearGradient>
  <linearGradient id="wall" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#DD9A7C"/><stop offset="1" stop-color="#B76D58"/></linearGradient>
  <linearGradient id="sand" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F3D4AB"/><stop offset="1" stop-color="#DCAF83"/></linearGradient>
  <linearGradient id="palm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#436955"/><stop offset="1" stop-color="#173F36"/></linearGradient>
  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#E7C6A2"/><stop offset="1" stop-color="#D6A884"/></linearGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".69" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".13"/></feComponentTransfer><feBlend mode="multiply" in2="SourceGraphic"/></filter>
  <radialGradient id="haze"><stop stop-color="#FFF1CD" stop-opacity=".65"/><stop offset="1" stop-color="#FFF1CD" stop-opacity="0"/></radialGradient>
  {defs}
</defs>
{body}
<rect width="100%" height="100%" fill="#8F775F" filter="url(#grain)" opacity=".12"/>
</svg>'''


def arch(x, y, w, h, color, stroke=None, sw=0):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<path d="M{x} {y+h}V{y+w/2}a{w/2} {w/2} 0 0 1 {w} 0V{y+h}Z" fill="{color}"{st}/>'


def window(x, y, w=64, h=115, warm=False, ornate=True):
    outer = '#EABD99' if not warm else '#D6AA89'
    inner = '#36594E' if not warm else '#9B593F'
    s = arch(x, y, w, h, outer)
    s += arch(x+8, y+10, w-16, h-17, inner)
    s += f'<path d="M{x+w/2} {y+17}V{y+h-7}M{x+10} {y+h*.62}H{x+w-10}" stroke="#183E36" stroke-opacity=".45" stroke-width="3"/>'
    if ornate:
        for k in range(1, 5):
            yy = y+31+k*(h-40)/5
            s += f'<path d="M{x+12} {yy}H{x+w-12}" stroke="#D8B48B" stroke-opacity=".38" stroke-width="2"/>'
        s += f'<path d="M{x-7} {y+h+2}H{x+w+7}v10H{x-7}Z" fill="#B67159"/><path d="M{x-7} {y+h+1}H{x+w+7}" stroke="#F2CFAC" stroke-width="4"/>'
    return s


def balcony(x, y, w, h=40):
    s = f'<path d="M{x} {y}H{x+w}v{h}H{x}Z" fill="#D99C7B"/><path d="M{x-6} {y}H{x+w+6}M{x-3} {y+h}H{x+w+3}" stroke="#F4CEAA" stroke-width="8"/>'
    for i in range(1, max(2, int(w/15))):
        xx=x+i*w/max(2,int(w/15))
        s += f'<path d="M{xx} {y+7}v{h-13}" stroke="#A85E4D" stroke-width="5"/>'
    return s


def palm(x, y, scale=1, rot=0, dark=False):
    color = '#193E35' if dark else 'url(#palm)'
    p = '<path d="M-5 315C5 205 13 97 0 0" fill="none" stroke="#6F674A" stroke-width="13"/>'
    for i in range(12):
        yy=32+i*22
        p+=f'<path d="M-3 {yy}l15 4" stroke="#B39A68" stroke-width="3" opacity=".55"/>'
    for ang, length, bend in [(-116,155,48),(-83,172,42),(-55,169,40),(-26,152,38),(8,160,42),(36,165,45),(68,145,45),(96,131,38)]:
        p+=f'<g transform="rotate({ang})"><path d="M0 0Q{bend} {-length*.55} 0 {-length}Q{-bend*.55} {-length*.5} 0 0Z" fill="{color}"/><path d="M0 -5V{-length+8}" stroke="#90A074" stroke-width="1.7" opacity=".35"/>'
        for k in range(1,10):
            yy=-length*k/11
            spread=math.sin(k/11*math.pi)*bend*.42
            p+=f'<path d="M0 {yy}l{spread} {-10}M0 {yy}l{-spread*.7} {-9}" fill="none" stroke="#D2CC9D" stroke-width="1.3" opacity=".19"/>'
        p+='</g>'
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({scale})">{p}</g>'


def person(x,y,scale=1,shirt='#F4E4C8',pants='#294A40'):
    return f'''<g transform="translate({x} {y}) scale({scale})"><ellipse cy="76" rx="19" ry="5" fill="#5C5845" opacity=".14"/><path d="M-6 40l-3 32M6 40l8 32" stroke="{pants}" stroke-width="9" stroke-linecap="round"/><path d="M-11 15Q0 10 11 15l4 31H-14Z" fill="{shirt}"/><path d="M-13 21l-8 24M12 21l9 22" stroke="#A47154" stroke-width="5.5" stroke-linecap="round"/><circle cy="2" r="9" fill="#A47154"/><path d="M-9 3Q-11 -10 0 -10Q12 -10 9 2L4 -3Z" fill="#283B32"/></g>'''


def birds(x, y, scale=1):
    return f'<g transform="translate({x} {y}) scale({scale})" fill="none" stroke="#6C7860" stroke-width="2.4" stroke-linecap="round"><path d="M0 6q9 -12 18 0q8 -11 17 -2M61 -17q6 -8 12 0q6 -9 12 -2M108 21q7 -9 14 0q6 -10 13 -2"/></g>'


morning = '''<rect width="720" height="1280" fill="url(#sky)"/>
<circle cx="548" cy="269" r="79" fill="#FAEBC4"/>
<ellipse cx="505" cy="340" rx="240" ry="270" fill="url(#haze)"/>
<path d="M0 825L720 800V1280H0Z" fill="url(#road)"/>
<path d="M405 703H607V891H405Z" fill="#D2AA86"/>
<path d="M438 670H576V718H438Z" fill="#DEB997"/>
<path d="M425 708H590" stroke="#EFD3B1" stroke-width="9"/>
'''
morning += arch(472, 765, 51, 105, '#786E50')
morning += '''<path d="M-44 182L356 273V1010L0 1106Z" fill="url(#wall)"/>
<path d="M356 273L390 286V980L356 1010Z" fill="#A8614F"/>
<path d="M0 198L368 282M0 226L368 307M0 516L366 574M0 561L366 615M0 833L365 856" stroke="#EDBC96" stroke-width="12"/>
<path d="M0 251L355 330M0 585L355 637" stroke="#A95E4B" stroke-width="7"/>
<path d="M0 180L355 262V281L0 200Z" fill="#F2C49D"/>
'''
for x,y,w,h in [(31,313,76,142),(164,345,70,135),(284,372,45,121),(31,656,77,132),(165,670,69,130),(286,691,43,116)]:
    morning += window(x,y,w,h)
morning += balcony(12,449,109,57)+balcony(147,474,102,49)+balcony(272,487,69,40)
morning += arch(139,875,113,208,'#EAB58C')+arch(153,892,85,191,'#2E5146')
morning += '<path d="M195 925V1083M153 997H238" stroke="#B49569" stroke-width="4"/><path d="M169 919V1079M220 919V1079" stroke="#75917A" stroke-width="2" opacity=".6"/>'
morning += '''<path d="M601 413L720 375V1063L600 955Z" fill="#EDCFAB"/><path d="M614 430L720 398M612 638L720 636M612 818L720 850" stroke="#D0A17A" stroke-width="10"/>
<path d="M633 704V582q0 -42 41 -42q42 0 42 42V731Z" fill="#D5AE88"/><path d="M645 704V586q0 -30 29 -30q30 0 30 30V719Z" fill="#52705A"/>
<path d="M590 951L720 1064V1280H643L367 1020Z" fill="#8A8066" opacity=".15"/>
<path d="M0 1110L357 1014L470 1080L94 1280H0Z" fill="#F4D3AA" opacity=".7"/>
<path d="M0 1248L387 1076M347 1280L461 1097M547 1280L525 1131M0 1169L642 1183" stroke="#AC8C6E" stroke-width="2" opacity=".3"/>
<path d="M344 380q166 93 373 18" fill="none" stroke="#7C7357" stroke-width="2"/>
<path d="M560 422v60" stroke="#7C7357" stroke-width="2"/><path d="M546 481h28l-4 18h-20Z" fill="#5B6650"/>
'''
morning += palm(704,338,1.68,-9)+palm(586,685,.45,3)
morning += person(422,963,.95,'#F2E5CC')+person(480,863,.46,'#A65F44')
morning += birds(402,194,.85)
morning += '<path d="M17 1068v-55h58v55" fill="#A86C4C"/><path d="M44 1015q-39 -54 -22 -87q25 17 23 62q5 -55 30 -77q12 47 -31 102" fill="#436F52"/>'


market = '''<rect width="720" height="1280" fill="url(#sky)"/>
<circle cx="507" cy="223" r="59" fill="#FBECCA"/>
<path d="M0 878L720 847V1280H0Z" fill="url(#road)"/>
<path d="M171 348H530V899H171Z" fill="#D79375"/>
<path d="M199 306H501V355H199Z" fill="#E7AD88"/>
<path d="M213 287H489V308H213Z" fill="#C37D60"/>
<path d="M244 267H459V290H244Z" fill="#E8B18C"/>
<path d="M300 251V215q51 -82 102 0v36Z" fill="#D59174"/>
<path d="M350 166v-24" stroke="#956C4B" stroke-width="4"/>
<path d="M161 365H540M160 572H540M169 615H531" stroke="#F0C4A0" stroke-width="10"/>
'''
market += arch(262,650,174,255,'#E8B28C')+arch(280,667,138,238,'#736B50')+arch(302,721,92,184,'#ADA683')
for x in [205,310,417]:market+=window(x,400,74,126)
for x in [185,228,466,509]:market+='<circle cx="%s" cy="590" r="7" fill="#AF6C55"/>'%x
market += '''<path d="M0 312L175 399V1029L0 1134Z" fill="#E4B48E"/>
<path d="M0 336L176 419M0 584L176 630M0 659L176 691" stroke="#F6D7B2" stroke-width="10"/>
<path d="M547 412L720 303V1093L547 1000Z" fill="#C57B61"/>
<path d="M550 440L720 350M550 644L720 588M550 690L720 645" stroke="#E6AC87" stroke-width="10"/>
'''
market += window(33,431,67,121)+window(605,431,68,127)+balcony(589,552,102,51)
market += '''<path d="M0 762L191 807L217 892L0 849Z" fill="#315B49"/>
<path d="M0 778L194 820M40 770L62 861M102 786L127 875M162 800L190 886" stroke="#A2AF83" stroke-width="14" opacity=".5"/>
<path d="M0 850L215 890V920L0 882Z" fill="#254A3D"/>
<path d="M516 803L720 744V836L500 888Z" fill="#E9C69D"/>
<path d="M544 796L529 881M603 779L596 866M663 760L662 847" stroke="#C87A5C" stroke-width="22" opacity=".75"/>
<path d="M500 886L720 834v27L500 912Z" fill="#BD7658"/>
<path d="M21 877v223M183 912v133M525 907v150M697 869v240" stroke="#725E40" stroke-width="7"/>
<path d="M-20 1050L182 1022L198 1124L0 1184Z" fill="#A5754E"/><path d="M0 1049L179 1021L200 1049L0 1098Z" fill="#C39B6D"/>
<path d="M543 1007L720 1034V1146L533 1103Z" fill="#9C6C48"/><path d="M542 1006L720 1034V1060L534 1032Z" fill="#D2A174"/>
<path d="M139 446Q335 519 582 456" fill="none" stroke="#696C4F" stroke-width="2"/>
<path d="M1 596Q319 726 719 581" fill="none" stroke="#746A4E" stroke-width="2"/>
'''
for x,y in [(53,615),(119,638),(191,655),(266,668),(344,670),(421,662),(497,648),(572,625),(648,604)]:
    market+=f'<path d="M{x} {y}l10 30l9 -27Z" fill="'+('#D79457' if x%3==0 else '#7B8D63')+'"/>'
for x,y in [(20,1042),(53,1036),(88,1029),(121,1023),(153,1017),(39,1058),(76,1051),(109,1045),(143,1039)]:
    market+=f'<circle cx="{x}" cy="{y}" r="18" fill="#E1A64E"/><path d="M{x-2} {y-19}l7 -6" stroke="#69794D" stroke-width="3"/>'
for x,y in [(565,999),(596,1007),(628,1011),(658,1018),(690,1023),(581,1020),(617,1031),(653,1038)]:
    market+=f'<ellipse cx="{x}" cy="{y}" rx="20" ry="13" fill="#71925C" transform="rotate(-18 {x} {y})"/>'
market += person(357,919,1.13,'#EEE2C3')+person(435,927,.88,'#BF7658')+person(285,872,.64,'#57745D')+person(383,816,.43,'#DBAA79')
market += palm(-23,227,1.18,5)+birds(454,117,.62)
market += '<path d="M183 1209L431 1008M536 1280L421 1078M0 1206L720 1190" fill="none" stroke="#B5906D" stroke-width="2" opacity=".3"/>'


chai = '''<rect width="720" height="1280" fill="url(#sky)"/>
<path d="M80 262H578V752H80Z" fill="#D79A7E"/>
<path d="M64 251H594V277H64Z" fill="#E9BA94"/>
<path d="M80 453H578M80 491H578M80 679H578" stroke="#EFCAAA" stroke-width="9"/>
'''
for x in [119,250,381,512]:chai+=window(x,316,46,96)
for x in [111,238,365,492]:chai+=window(x,532,65,122)+balcony(x-10,634,86,39)
chai += '''<path d="M0 745Q358 684 720 747V835H0Z" fill="#D3BE98"/>
<path d="M0 753Q357 693 720 754" stroke="#F1DDAD" stroke-width="17" fill="none"/>
<path d="M0 820L720 794V1280H0Z" fill="#D39470"/>
<path d="M0 852L720 826M0 1061L720 1037M0 1240L720 1212" stroke="#C18463" stroke-width="3" opacity=".55"/>
<path d="M91 812L116 1280M563 803L604 1280" stroke="#B77A59" stroke-width="2" opacity=".5"/>
<ellipse cx="390" cy="1064" rx="209" ry="63" fill="#6D7150" opacity=".17"/>
<ellipse cx="330" cy="1031" rx="178" ry="64" fill="#214C40"/>
<ellipse cx="328" cy="1016" rx="175" ry="58" fill="#426B53"/>
<ellipse cx="328" cy="1015" rx="140" ry="41" fill="none" stroke="#92A57B" stroke-width="3" opacity=".5"/>
<path d="M218 837L242 1005Q330 1040 418 1005L443 837Z" fill="url(#cup)"/>
<path d="M241 1000Q330 1028 419 1000L418 1011Q330 1040 242 1011Z" fill="#A26240"/>
<path d="M239 880L257 992" stroke="#F5BE8D" stroke-width="10" stroke-linecap="round" opacity=".35"/>
<ellipse cx="331" cy="837" rx="113" ry="43" fill="#DAA375"/>
<ellipse cx="331" cy="836" rx="101" ry="33" fill="#704A2D"/>
<ellipse cx="331" cy="840" rx="96" ry="29" fill="#B77944"/>
<path d="M246 838Q275 815 321 820" fill="none" stroke="#D8A46A" stroke-width="5" stroke-linecap="round"/>
<g fill="#D9AC78" opacity=".9"><circle cx="386" cy="833" r="3"/><circle cx="394" cy="839" r="2"/><circle cx="379" cy="841" r="2"/><circle cx="399" cy="833" r="1.8"/><circle cx="386" cy="847" r="1.6"/></g>
<path d="M294 774C260 734 331 714 297 660M341 771C378 735 303 709 343 648M374 778C408 746 367 724 387 694" stroke="#FFF2D3" stroke-width="7" stroke-linecap="round" fill="none" opacity=".7"/>
<ellipse cx="568" cy="1110" rx="105" ry="40" fill="#6D7150" opacity=".16"/>
<ellipse cx="555" cy="1082" rx="101" ry="35" fill="#F1D7AE"/>
<ellipse cx="555" cy="1076" rx="93" ry="30" fill="#F5E5C8"/>
<g transform="rotate(-18 540 1064)"><rect x="488" y="1038" width="100" height="41" rx="11" fill="#C68D49"/><rect x="488" y="1034" width="100" height="37" rx="10" fill="#E1B778"/><path d="M503 1045h69M503 1058h69" stroke="#C4985F" stroke-width="3" stroke-dasharray="3 6"/></g>
<g transform="rotate(18 564 1086)"><rect x="518" y="1063" width="100" height="39" rx="11" fill="#C68D49"/><rect x="518" y="1059" width="100" height="35" rx="10" fill="#E6BF82"/><path d="M533 1070h69M533 1083h69" stroke="#C4985F" stroke-width="3" stroke-dasharray="3 6"/></g>
<path d="M36 1155l136 -16l9 85l-136 17Z" fill="#365845"/><path d="M45 1157l119 -14l6 73l-119 14Z" fill="#F3DDB7"/><path d="M62 1167l88 -10M64 1178l88 -10M66 1189l60 -7" stroke="#BDA883" stroke-width="2" opacity=".4"/>
<path d="M181 1147l12 -4l24 79l-8 3Z" fill="#A56843"/>
<path d="M0 0H720V86Q338 17 0 167Z" fill="#254D3F"/>
<path d="M0 129Q298 1 720 57" fill="none" stroke="#48684A" stroke-width="10"/>
'''
chai += palm(706,262,1.08,-8)+palm(-28,350,.87,14)+birds(329,166,.62)
chai_defs='<linearGradient id="cup" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#D4925C"/><stop offset=".4" stop-color="#CA8250"/><stop offset="1" stop-color="#A7623E"/></linearGradient>'


evening = '''<rect width="720" height="1280" fill="url(#dusk)"/>
<circle cx="211" cy="410" r="84" fill="#E5AF72"/>
<ellipse cx="204" cy="459" rx="254" ry="267" fill="url(#sunGlow)"/>
<path d="M0 674Q167 654 359 694T720 687V1280H0Z" fill="url(#water)"/>
<path d="M-20 639H98V581h31v-25h15v25h30v89h46v-78h14v-30h19v30h22v91h52v-64h24v-37h20v37h16v80H-20Z" fill="#718071" opacity=".53"/>
<path d="M404 453H720V968H404Z" fill="#BD8063"/>
<path d="M431 411H697V456H431Z" fill="#D5A07B"/>
<path d="M416 445H720V467H416Z" fill="#E1B38B"/>
<path d="M481 410V362q0 -64 74 -85q75 20 75 85v48Z" fill="#C88F6C"/>
<path d="M480 391H633" stroke="#E3B68C" stroke-width="9"/>
<path d="M555 279v-35" stroke="#A88D64" stroke-width="5"/>
<path d="M403 639H720M403 673H720M403 825H720" stroke="#E0AF86" stroke-width="10"/>
'''
for x in [441,540,639]:
    evening += arch(x,505,56,101,'#DBAC82')+arch(x+8,514,40,87,'#EDC483')
    evening += f'<path d="M{x+28} 526V602M{x+10} 566h36" stroke="#8F7552" stroke-width="3"/>'
for x in [432,530,628]:evening+=arch(x,718,68,107,'#E0AF84')+arch(x+8,728,52,97,'#486653')
evening += '''<path d="M392 856H720V891H392Z" fill="#E0AE83"/>
<path d="M370 891H720V931H370Z" fill="#A47158"/>
<path d="M349 931H720V973H349Z" fill="#CE9672"/>
<path d="M322 973H720V1017H322Z" fill="#916C55"/>
<path d="M293 1017H720V1065H293Z" fill="#BE8867"/>
<path d="M267 1065H720V1118H267Z" fill="#866B53"/>
<path d="M240 1118H720V1174H240Z" fill="#AA7C5F"/>
<path d="M216 1174H720V1233H216Z" fill="#77654F"/>
<path d="M188 1233H720V1280H188Z" fill="#A2795D"/>
<g stroke="#ECC395" stroke-width="3" opacity=".6"><path d="M392 856H720M370 891H720M349 931H720M322 973H720M293 1017H720M267 1065H720M240 1118H720M216 1174H720M188 1233H720"/></g>
<g fill="none" stroke-linecap="round"><path d="M75 727h172M108 748h108M65 779h217M117 811h118M91 846h175M112 884h104M83 929h139M79 975h110M51 1042h161M33 1101h148M30 1171h101" stroke="#D8AD77" stroke-width="6" opacity=".37"/>
<path d="M0 713h83M270 757h84M20 822h48M245 855h77M5 906h61M210 974h54M1 1012h40M185 1132h30" stroke="#9BAC8C" stroke-width="2" opacity=".24"/></g>
<path d="M385 489Q584 549 720 493" fill="none" stroke="#5E6047" stroke-width="2"/>
'''
for x,y in [(404,497),(446,509),(490,518),(537,524),(583,525),(627,520),(671,510),(712,498)]:
    evening+=f'<circle cx="{x}" cy="{y}" r="10" fill="#EDBE78" opacity=".12"/><circle cx="{x}" cy="{y}" r="3.5" fill="#FFE2A1"/>'
evening += palm(710,281,1.46,7,True)+palm(43,383,.81,-5,True)
evening += person(471,902,.75,'#E4C39A','#314D3F')+person(569,1016,.88,'#254B40','#D6B080')
evening += '''<g transform="translate(422 1082)"><ellipse cx="0" cy="33" rx="30" ry="9" fill="#6D5A44" opacity=".3"/><path d="M-14 19q0 -29 14 -29q14 0 15 29l22 10H-36Z" fill="#D4B58D"/><circle cy="-19" r="8" fill="#937353"/><path d="M-8 -23q8 -12 16 1" fill="#283F34"/></g>
<g fill="#ECD8AD" opacity=".7"><circle cx="184" cy="137" r="1.5"/><circle cx="366" cy="212" r="1.8"/><circle cx="491" cy="123" r="1.2"/><circle cx="98" cy="260" r="1.5"/><circle cx="303" cy="80" r="1.2"/></g>'''
evening_defs='''<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#234D46"/><stop offset=".5" stop-color="#82947B"/><stop offset="1" stop-color="#E1B98A"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#657D68"/><stop offset="1" stop-color="#264E44"/></linearGradient><radialGradient id="sunGlow"><stop stop-color="#F4C485" stop-opacity=".25"/><stop offset="1" stop-color="#F4C485" stop-opacity="0"/></radialGradient>'''


cover = '''<rect width="1280" height="640" fill="url(#sky)"/><circle cx="876" cy="166" r="80" fill="#F8E4B9"/>
<path d="M0 468Q631 432 1280 466V640H0Z" fill="#E4C29B"/>
<path d="M201 142H568V504H201Z" fill="url(#wall)"/><path d="M183 130H586V154H183Z" fill="#EDBC94"/><path d="M229 95H539V132H229Z" fill="#DEA07D"/>
<path d="M250 75H517V99H250Z" fill="#C98264"/><path d="M320 74V49q63 -69 127 0v25Z" fill="#DA9C78"/>
<path d="M193 319H577M199 351H570" stroke="#F0C5A0" stroke-width="9"/>
'''
for x in [235,343,452]: cover+=window(x,185,78,109)
cover+=arch(328,379,116,135,'#EDBD93')+arch(342,390,88,124,'#35574A')
cover+='''<path d="M568 287H841V507H568Z" fill="#E7B691"/><path d="M555 275H851V299H555Z" fill="#F1D0A9"/><path d="M0 332H201V540H0Z" fill="#D4A37E"/>
<path d="M846 324H1084V518H846Z" fill="#C9896B"/><path d="M824 311H1105V334H824Z" fill="#E9B68C"/>
<path d="M0 572L540 519L947 640H0Z" fill="#F2D3AC"/><path d="M727 529L1280 499V640H994Z" fill="#6E7B5C" opacity=".18"/>'''
for x in [595,672,749]:cover+=window(x,339,50,84)
for x in [876,967]:cover+=window(x,370,61,98)
cover+=palm(1111,158,1.35,9)+palm(73,179,1.15,-6)+palm(804,377,.42,4)
cover+=person(605,493,.85,'#F6E6CD')+person(661,479,.62,'#B26D4E')+birds(663,118,1)


SCENES={
    'scene-morning': svg(morning),
    'scene-market': svg(market),
    'scene-chai': svg(chai,chai_defs),
    'scene-evening': svg(evening,evening_defs),
    'cover-india': svg(cover,width=1280,height=640),
}

for name,source in SCENES.items():
    (ROOT/f'{name}.svg').write_text(source,encoding='utf-8')
    print(f'Wrote {name}.svg')

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('--videos',action='store_true')
    args=parser.parse_args()
    if args.videos:
        for name in SCENES:
            if name=='cover-india': continue
            image=ROOT/f'{name}.png'
            subprocess.run(['inkscape',str(ROOT/f'{name}.svg'),'--export-type=png',f'--export-filename={image}','--export-width=720','--export-height=1280'],check=True,stdout=subprocess.DEVNULL)
            # Cosine breathing zoom starts and ends at the same framing for a
            # seamless 12-second loop. No synthetic speech or captions.
            vf="zoompan=z='1.025+0.025*sin(on*2*PI/288)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=288:s=360x640:fps=24,format=yuv420p"
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(image),'-vf',vf,'-frames:v','288','-c:v','libx264','-preset','medium','-crf','26','-maxrate','500k','-bufsize','1000k','-movflags','+faststart','-an',str(ROOT/f'{name}.mp4')],check=True)
            image.unlink()
            print(f'Wrote {name}.mp4')

