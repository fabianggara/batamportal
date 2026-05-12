const hargaApel = 5000;
const hargaPisang = 10000;
const totalApel = 3;
const totalPisang = 2;
const diskon = 0.1;

const totalHarga = (3 * hargaApel) + (2 * hargaPisang);
const totalHargaSesudahDiskon = totalHarga - totalHarga * diskon;

console.log(totalHargaSesudahDiskon);