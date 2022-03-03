'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);


  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //км
    this.duration = duration; // мин
  }
}

class Running extends Workout{
  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout{
  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

// const run = new Running([50, 50], 7, 40, 170);
// const cycl = new Cycling([50, 50], 30, 80, 200);

// console.log(run, cycl);



class App {
  // переменные для карты и для событий на карте
  #map;
  #mapEvent;

  constructor() {
    // Получение местоположения
    this._getPosition();

    // Обработчики событий
    form.addEventListener('submit', (e) => this._newWorkout(e));
    inputType.addEventListener('change', this._toggleClimbField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( //получение координат местонахожения
        this._loadMap.bind(this), // вызывается как обычная funс, теряется контекст
        function (error) {
          alert('Error: ' + error);
        }
      );
    }
  }

  _loadMap(position) {
    const {latitude, longitude} = position.coords;
    console.log(`https://yandex.ru/maps/?ll=${longitude}%2C${latitude}&z=8.49`);
  
    const coords = [latitude, longitude];
  
    this.#map = L.map('map').setView(coords, 13); // карты из библиотеки Leaflet

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    // удалить
    L.marker(coords) //маркер
      .addTo(this.#map)
      .bindPopup('Ты тут')
      .openPopup();

    // Обработка клика по карте
    this.#map.on('click', (e) => this._showForm(e));
  }

  _showForm(e) {
    this.#mapEvent = e;

    form.classList.remove('hidden'); // показ формы
    inputDistance.focus(); // курсор для ввода дистанции
  }

  _toggleClimbField() {
    inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    console.log(this);
    
    // Очистка формы
    inputDistance.value =
      inputDuration.value =
      inputTemp.value =
      inputClimb.value = '';
  
    const {lat,lng} = this.#mapEvent.latlng; //координаты
  
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup({ //добавление и настройка маркера
        autoClose: false,
        closeOnClick: false,
        className: 'cycling-popup'
      }))
      .setPopupContent('Треня') // контент на маркере
      .openPopup();
  } 
}

const app = new App();




// отправка данных



