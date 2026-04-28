export const NIGERIA_LOCATIONS = {
  Abia: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu'],
  Adamawa: ['Yola', 'Mubi', 'Numan', 'Jimeta'],
  'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
  Bauchi: ['Bauchi', 'Azare', 'Misau', 'Jamaare'],
  Bayelsa: ['Yenagoa', 'Brass', 'Kaiama', 'Ogbia'],
  Benue: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'],
  Borno: ['Maiduguri', 'Biu', 'Konduga', 'Dikwa'],
  'Cross River': ['Calabar', 'Ikom', 'Ogoja', 'Ugep'],
  Delta: ['Asaba', 'Warri', 'Sapele', 'Ughelli'],
  Ebonyi: ['Abakaliki', 'Afikpo', 'Onueke', 'Ishieke'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'],
  Ekiti: ['Ado Ekiti', 'Ikere Ekiti', 'Ikole Ekiti', 'Ijero Ekiti'],
  Enugu: ['Enugu', 'Nsukka', 'Agbani', 'Oji River'],
  Gombe: ['Gombe', 'Kumo', 'Billiri', 'Dukku'],
  Imo: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
  Jigawa: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure'],
  Kaduna: ['Kaduna', 'Zaria', 'Kafanchan', 'Sabon Tasha'],
  Kano: ['Kano', 'Wudil', 'Gaya', 'Bichi'],
  Katsina: ['Katsina', 'Daura', 'Funtua', 'Malumfashi'],
  Kebbi: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
  Kogi: ['Lokoja', 'Okene', 'Anyigba', 'Kabba'],
  Kwara: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba'],
  Lagos: ['Ikeja', 'Lagos Island', 'Lekki', 'Surulere', 'Yaba', 'Ajah'],
  Nasarawa: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa'],
  Niger: ['Minna', 'Suleja', 'Bida', 'Kontagora'],
  Ogun: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota'],
  Ondo: ['Akure', 'Ondo', 'Owo', 'Ikare'],
  Osun: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
  Oyo: ['Ibadan', 'Ogbomoso', 'Oyo', 'Saki'],
  Plateau: ['Jos', 'Bukuru', 'Pankshin', 'Shendam'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Eleme'],
  Sokoto: ['Sokoto', 'Tambuwal', 'Wurno', 'Gwadabawa'],
  Taraba: ['Jalingo', 'Wukari', 'Bali', 'Takum'],
  Yobe: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'],
  Zamfara: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Tsafe'],
  FCT: ['Abuja', 'Gwagwalada', 'Kubwa', 'Lugbe'],
};

export const NIGERIA_STATES = Object.keys(NIGERIA_LOCATIONS);

export const EMPTY_ADDRESS_FORM = {
  type: 'Home',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Nigeria',
  phone: '',
};

export function isAddressValid(address) {
  return Boolean(
    String(address?.address || '').trim() &&
      String(address?.city || '').trim() &&
      String(address?.state || '').trim() &&
      String(address?.phone || '').trim()
  );
}
