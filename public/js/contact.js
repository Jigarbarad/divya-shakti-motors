App.add({
  en: { pg_title: 'Contact Us', pg_sub: "Visit the showroom, or call or WhatsApp us. We're happy to help.",
        lbl_addr: 'Address', lbl_phone: 'Phone',
        addr: 'Highway, Veraval-Prashnavada-Kodinar Rd, opp. Mamladar Office, Sutrapada, Gujarat 362275' },
  gu: { pg_title: 'અમારો સંપર્ક કરો', pg_sub: 'શોરૂમની મુલાકાત લો, અથવા કૉલ કે વોટ્સએપ કરો. અમે ખુશીથી મદદ કરીશું.',
        lbl_addr: 'સરનામું', lbl_phone: 'ફોન',
        addr: 'હાઇવે, વેરાવળ-પ્રશ્નાવડા-કોડીનાર રોડ, મામલતદાર કચેરીની સામે, સુત્રાપાડા, ગુજરાત 362275' },
});

const hours = () => App.renderHours(App.$('#hours'), App.$('#status'));
App.init('contact', async () => {
  hours(); App.onLang(hours);
});
