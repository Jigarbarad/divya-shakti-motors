App.add({
  en: { pg_title: 'Contact Us', pg_sub: "Visit the showroom, call us, or send a message and we'll get back to you.",
        lbl_addr: 'Address', lbl_phone: 'Phone',
        addr: 'Highway, Veraval-Prashnavada-Kodinar Rd, opp. Mamladar Office, Sutrapada, Gujarat 362275',
        msg_eyebrow: 'Send a Message', msg_h2: 'Write to us', msg_lead: 'Questions about a bike, price, service or anything else? Send us a note.' },
  gu: { pg_title: 'અમારો સંપર્ક કરો', pg_sub: 'શોરૂમની મુલાકાત લો, કૉલ કરો અથવા સંદેશ મોકલો, અમે તમને જવાબ આપીશું.',
        lbl_addr: 'સરનામું', lbl_phone: 'ફોન',
        addr: 'હાઇવે, વેરાવળ-પ્રશ્નાવડા-કોડીનાર રોડ, મામલતદાર કચેરીની સામે, સુત્રાપાડા, ગુજરાત 362275',
        msg_eyebrow: 'સંદેશ મોકલો', msg_h2: 'અમને લખો', msg_lead: 'બાઇક, કિંમત, સર્વિસ કે બીજું કંઈ પૂછવું છે? અમને સંદેશ મોકલો.' },
});

const hours = () => App.renderHours(App.$('#hours'), App.$('#status'));
App.init('contact', async () => {
  hours(); App.onLang(hours);
  App.enquiryForm(App.$('#formHost'), { types: ['contact'] });
});
