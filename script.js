'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const {latitude, longitude} = position.coords;
      console.log(`https://yandex.ru/maps/?ll=${longitude}%2C${latitude}&z=8.49`);

      const coords = [latitude, longitude];

      const map = L.map('map').setView(coords, 13);

      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);
    
      L.marker(coords) //маркер
      .addTo(map)
      .bindPopup('Ты тут')
      .openPopup();

      map.on('click', (mapEvent) => { // при нажатии на карту

        const {lat, lng} = mapEvent.latlng; //координаты
        L.marker([lat, lng]).addTo(map).bindPopup(L.popup({ //добавление и настройка маркера
          autoClose: false,
          closeOnClick: false,
          className: 'cycling-popup'
        }))
        .setPopupContent('Ты тут') // контент на маркере
        .openPopup();
      });
    },
    function(error) {
      alert('Error: ' + error);
    }
  );
}

