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

  _setDescription() {
    this.type === 'running'
      ? this.description = `Пробежка ${new Intl.DateTimeFormat('ru-RU')
        .format(this.date)}`
      : this.description = `Велотренировка ${new Intl.DateTimeFormat('ru-RU')
        .format(this.date)}`;
  }
}

class Running extends Workout{
  type = 'running';

  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
    this._setDescription();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout{
  type = 'cycling';

  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
    this._setDescription();
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
  #workouts = [];

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

    // Обработка клика по карте
    this.#map.on('click', (e) => this._showForm(e));
  }

  _showForm(e) {
    this.#mapEvent = e;

    form.classList.remove('hidden'); // показ формы
    inputDistance.focus(); // курсор для ввода дистанции
  }

  _hideForm() {
    inputDistance.value =
    inputDuration.value =
    inputTemp.value =
    inputClimb.value = '';
    form.classList.add('hidden');
  }

  _toggleClimbField() {
    inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const {lat,lng} = this.#mapEvent.latlng; //координаты
    let workout;

    // функция на проверку число или нет, вернет число
    const areNumber = (...numbers) => numbers.every(num => Number.isFinite(num));

    // Получение данных из формы
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;


    // Если пробежка - объект Running
    if (type === 'running') {
      const temp = +inputTemp.value;
      // Проверка валидности данных
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(temp)
        !areNumber(distance, duration, temp)
      )
        return alert('Введите число');
      workout = new Running( [lat, lng], distance, duration, temp);
    }
    // Если велотренировка - объект Cycling
    if (type === 'cycling') {
      const climb = +inputClimb.value;
      // Проверка валидности данных
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(climb)
        !areNumber(distance, duration, climb)
      )
        return alert('Введите число');
      workout = new Cycling( [lat, lng], distance, duration, climb);
    }
    // Добавить объект в массив тренировок
    this.#workouts.push(workout);

    //Отобразить тренировку на карте
    this._displayWorkout(workout);

    // Отобразить тренировку в списке
    this._displayWorkoutOnSidebar(workout);

    // Очистка формы и скрытие её
    this._hideForm();
  
  } 

  _displayWorkout(workout) {
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(L.popup({ //добавление и настройка маркера
      autoClose: false,
      closeOnClick: false,
      className: `${workout.type}-popup`
    }))
    .setPopupContent(`${workout.type === 'running' ? '🏃': '🚵'} ${workout.description}`) // контент на маркере
    .openPopup();
  }

  _displayWorkoutOnSidebar(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🏃': '🚵'}</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">км</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">мин</span>
      </div>
    `;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">📏⏱</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">мин/км</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">👟⏱</span>
          <span class="workout__value">${workout.temp}</span>
          <span class="workout__unit">шаг/мин</span>
        </div>
      </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">📏⏱</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">км/ч</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🏔</span>
          <span class="workout__value">${workout.climb}</span>
          <span class="workout__unit">м</span>
        </div>
      </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();




// отправка данных



