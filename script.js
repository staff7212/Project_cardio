'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

let map, mapEvent; // переменные для карты и для событий на карте

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition( //получение координат местонахожения
    function (position) {
      const {
        latitude,
        longitude
      } = position.coords;
      console.log(`https://yandex.ru/maps/?ll=${longitude}%2C${latitude}&z=8.49`);
    
      const coords = [latitude, longitude];
    
      map = L.map('map').setView(coords, 13); // карты из библиотеки Leaflet

      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker(coords) //маркер
        .addTo(map)
        .bindPopup('Ты тут')
        .openPopup();

      // Обработка клика по карте
      map.on('click', (event) => { // при нажатии на карту
        mapEvent = event;

        form.classList.remove('hidden'); // показ формы
        inputDistance.focus(); // курсор для ввода дистанции
      });
    },
    function (error) {
      alert('Error: ' + error);
    }
  );
}


// отправка данных
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Очистка формы
  inputDistance.value =
    inputDuration.value =
    inputTemp.value =
    inputClimb.value = '';

  const {
    lat,
    lng
  } = mapEvent.latlng; //координаты

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(L.popup({ //добавление и настройка маркера
      autoClose: false,
      closeOnClick: false,
      className: 'cycling-popup'
    }))
    .setPopupContent('Треня') // контент на маркере
    .openPopup();
});

inputType.addEventListener('change', () => {
  inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
  inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
});
