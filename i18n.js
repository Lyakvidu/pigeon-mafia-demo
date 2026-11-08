'use strict';

(() => {
  const messages = {
    'Продолжить дело':'Continue the job',
    'Первое дело':'First job',
    'ШТАБ СТАИ':'FLOCK HQ',
    'Карта дел':'Job map',
    'Карта города':'City map',
    'На крышу':'Back to the roof',
    'Закрыт':'Locked',
    'дел':'jobs',
    'глав':'chapters',
    'Районы города':'City districts',
    'Шесть районов':'Six districts',
    'Предметы на крыше':'Rooftop landmarks',
    'Крыша штаба стаи над вечерним городом':'Flock headquarters above the city at dusk',
    'Подойди к голубю и нажми Q.':'Approach a pigeon and press Q.',
    'Позови голубя, пока он рядом.':'Call the nearby pigeon.',
    'Веди голубя клавишами WASD или щелчком по площади.':'Move with WASD or click the square.',
    'Движение':'Move',
    'Замок':'Lock',
    'Три клевка по замку. Голубь пойдёт за тобой.':'Peck the lock three times. The bird will follow you.',
    'Позови голубя. Он пойдёт за тобой.':'Call the pigeon. It will follow you.',
    'Стая отвлечёт людей. Ты сможешь забрать добычу.':'The flock distracts people so you can take the loot.',
    'Взлёт помогает пересечь опасный участок.':'Take flight to cross the hazard.',
    'Целый город. Одна стая.':'One city. One flock.',
    'КАМПАНИЯ · 150 ЗАКАЗОВ':'CAMPAIGN · 150 JOBS',
    'Шесть районов. Пятнадцать глав.':'Six districts. Fifteen chapters.',
    'Весь маршрут':'Full route',
    'Главы кампании':'Campaign chapters',
    'Сначала заверши нужную главу.':'Complete the required chapter first.',
    'Недопустимый результат задания.':'Invalid mission result.',
    'Повреждены данные прогресса.':'The progress data is damaged.',
    'Повреждён баланс крошек.':'The crumb balance is damaged.',
    'Повреждены данные улучшений.':'The upgrade data is damaged.',
    'Операция сохранения отменена.':'The save operation was cancelled.',
    'Подкрепление готово. Союзник пойдёт за тобой.':'Backup is here. Your ally will follow you.',
    'Стая отвлекает прохожих. Действуй.':'The flock is distracting passers-by. Make your move.',
    'Стая рядом. Следуй плану заказа.':'Your flock is here. Follow the job plan.',
    'Голубиная мафия — Картошка фри': 'Pigeon Mafia — French Fry Job',
    'ГОЛУБИНАЯ': 'PIGEON',
    'МАФИЯ': 'MAFIA',
    'Голубиная': 'Pigeon',
    'мафия': 'Mafia',
    'Операция «Картошка фри»': 'Operation French Fry',
    'Картошка фри': 'French fry job',
    'КАРТОШКА ФРИ': 'FRENCH FRY JOB',
    'ОПЕРАЦИЯ 01': 'OPERATION 01',
    'Два района. Одна стая.': 'Two districts. One flock.',
    'Два района. Десять заказов.': 'Two districts. Ten jobs.',
    'Своя стая и своё гнездо.': 'Your own flock and a nest to call home.',
    'Тестовая демоверсия.': 'Playable demo.',
    'Графика и музыка созданы для игры.': 'Original artwork and music made for this game.',
    'Шрифт Golos Text': 'Golos Text typeface',
    'Лицензия SIL OFL 1.1': 'SIL OFL 1.1 license',
    'ДЕМО · 10 ЗАКАЗОВ': 'DEMO · 10 JOBS',
    'Главное меню': 'Main menu',
    'Продолжить': 'Continue',
    'Заказы': 'Jobs',
    'Гнездо и стая': 'Nest & flock',
    'Настройки': 'Settings',
    'Как играть': 'How to play',
    'Об игре': 'About',
    'В главное меню': 'Main menu',
    'Начать заново': 'Restart',
    'Ещё налёт': 'Try again',
    'К заказам': 'Back to jobs',
    'На дело': 'Start job',
    'Назад': 'Back',
    'Всё понятно': 'Got it',
    'Пауза': 'Paused',
    'Пауза (Esc)': 'Pause (Esc)',
    'СТАЯ НА ПЕРЕКУРЕ': 'THE FLOCK IS TAKING A BREAK',
    'ПОД СЕБЯ': 'MAKE IT YOURS',
    'Язык / Language': 'Language',
    'Музыка': 'Music',
    'Звуки': 'Sound effects',
    'Подсказки': 'Hints',
    'Джойстик справа': 'Joystick on the right',
    'Меньше анимации': 'Reduce motion',
    'Сбросить настройки': 'Reset settings',
    'Управление': 'Controls',
    'Джойстик движения': 'Movement joystick',
    'Позвать стаю': 'Call the flock',
    'Картошка в гнезде': 'Food in the nest',
    'Игровая площадь. Касание задаёт путь голубю.': 'Play area. Tap to move the pigeon.',
    'Три голубя с картошкой на крыше вечернего города': 'Three pigeons with fries on a rooftop at dusk',
    'Развитие гнезда и стаи': 'Nest and flock upgrades',
    'ИНСТРУКТАЖ СТАИ': 'FLOCK BRIEFING',
    'План налёта': 'The plan',
    'Подойди к столику': 'Approach a table',
    'Веди голубя джойстиком или коснись площади.': 'Use the joystick or tap the square to move.',
    'WASD, стрелки или щелчок мышью по площади.': 'Use WASD, arrow keys or click the square to move.',
    'Утащи картошку': 'Grab the fries',
    'Нажми «Украсть» рядом с едой.': 'Tap “Steal” when you are near food.',
    'На клавиатуре — E или пробел.': 'On a keyboard, press E or Space.',
    'Позови своих': 'Call your friends',
    '«Стая» рядом с голубем зовёт его с собой. У столика — отвлекает людей.': 'Use “Flock” near a pigeon to recruit it. Near a table, the flock distracts people.',
    'Клавиша Q.': 'Press Q on a keyboard.',
    'Накорми семью': 'Feed the family',
    'Принеси две порции в гнездо слева внизу. Дворника обходи, от кота уворачивайся.': 'Bring two portions to the nest at the bottom left. Avoid the sweeper and dodge the cat.',
    'WASD — ходить': 'WASD — move',
    'Q — стая': 'Q — flock',
    'Esc — пауза': 'Esc — pause',
    'ПРОБЕЛ / E': 'SPACE / E',
    'ДЕЙСТВИЕ': 'ACTION',
    'СТАЯ': 'FLOCK',
    'ПОЗВАТЬ': 'CALL',
    'ОТВЛЕКАЕТ': 'DISTRACTING',
    'ПЕРЕДЫШКА': 'RESTING',
    'РЯДОМ С ГОЛУБЕМ': 'NEAR A PIGEON',
    'ОТВЛЕЧЬ ·': 'DISTRACT ·',
    'В СТАЕ ·': 'IN FLOCK ·',
    'ВЗЛЁТ': 'FLY',
    'ПРОГНАТЬ': 'SHOO',
    'ЗАЩИТИТЬ': 'DEFEND',
    'В ГНЕЗДО': 'DROP OFF',
    'УКРАСТЬ': 'STEAL',
    'КЛЮНУТЬ': 'PECK',
    'ЗАНЯТЬ': 'CLAIM',
    'СВИСТ': 'WHISTLE',
    'ОТКРЫТЬ': 'OPEN',
    'ЗАДВИЖКА': 'UNLATCH',
    'ЗАБРАТЬ': 'PICK UP',
    'ЗАКРЫТО': 'CLOSED',
    'ТИХО': 'CLEAR',
    'ШУМ': 'NOISE',
    'ПОГОНЯ!': 'CHASE!',
    'КОТ!': 'CAT!',
    'ВОКЗАЛЬНАЯ ПЛОЩАДЬ': 'STATION SQUARE',
    'РЫНОК У КАНАЛА': 'CANAL MARKET',
    'ДЕЛА СТАИ': 'FLOCK BUSINESS',
    'ДОМ СТАИ': 'HOME OF THE FLOCK',
    'Гнездо': 'The nest',
    'крошек': 'crumbs',
    'с': 's',
    'Рекорд': 'Best',
    'Награда уже получена': 'Reward already claimed',
    'Завершено': 'Complete',
    'Улучшить': 'Upgrade',
    'Улучшение сохранено.': 'Upgrade saved.',
    'Улучшение уже завершено.': 'This upgrade is already complete.',
    'Пока не хватает крошек.': 'Not enough crumbs yet.',
    'Хранилище пока недоступно.': 'Storage is not available yet.',
    'Не удалось сохранить прогресс. Разреши хранение данных сайта и попробуй ещё раз.': 'Could not save your progress. Allow this site to store data, then try again.',
    'Сизый — разведчик': 'Slate — scout',
    'Рыжик — курьер': 'Rusty — courier',
    'Гром — защитник': 'Thunder — protector',
    'Спасай голубей в заказах, чтобы расширить стаю.': 'Rescue pigeons during jobs to grow your flock.',
    'Уютное гнездо': 'A proper nest',
    'Сильные крылья': 'Strong wings',
    'Сбор стаи': 'Flock rally',
    'Новая подстилка и навес. При доставке быстрее восстанавливается взлёт.': 'New bedding and a roof. Deliveries recharge your flight sooner.',
    'Взлёт восстанавливается на секунду быстрее за каждый уровень.': 'Each level reduces the flight cooldown by one second.',
    'По одному союзнику ждёт у гнезда за каждый уровень.': 'One extra ally starts near the nest for each level.',
    'Шумная компания': 'A noisy crowd',
    'Письмо на лапке': 'Special delivery',
    'Своих не бросаем': 'Leave no bird behind',
    'Наш двор': 'Our turf',
    'Против ветра': 'Against the wind',
    'Тихая смена': 'Quiet shift',
    'Уборка по плану': 'Sweep the way',
    'Через весь рынок': 'Across the market',
    'Большой налёт': 'The big heist',
    'Перехват квартала': 'Block takeover',
    'Срочная посылка': 'Express parcel',
    'Двойной обход': 'Double diversion',
    'Укради две порции с любых столиков и принеси их в гнездо.': 'Steal two portions from any tables and bring them to the nest.',
    'Дальше — отвлечение прохожих стаей.': 'Next up: distract people with your flock.',
    'Позови голубя. Отвлеки людей у левого столика и забери пакет, пока они смотрят на стаю.': 'Recruit a pigeon. Distract people at the left table and grab the parcel while they watch your flock.',
    'Дальше — доставка через всю площадь.': 'Next up: a delivery across the square.',
    'Забери письмо у кафе, отметься у правой скамейки и вернись в гнездо. Дворник следит за курьером.': 'Collect the letter by the cafe, pass the right-hand bench and return to the nest. The sweeper is watching the courier.',
    'Откроется короткий полёт — кнопка «Взлёт».': 'Unlocks a short flight with the “Fly” button.',
    'Трижды клюнь замок клетки. Освобождённый голубь пойдёт за тобой. Доведи его до гнезда.': 'Peck the cage lock three times. The freed pigeon will follow you. Lead it to the nest.',
    'В стаю вступит разведчик Сизый. Он показывает поле зрения дворника.': 'Slate the scout joins your flock. He reveals the sweeper’s field of view.',
    'Приведи союзника к каждому из трёх флажков. Нажми «Занять» и удержи место. Стая отгоняет соперников.': 'Bring an ally to each of the three flags. Press “Claim” and hold your ground. Your flock drives rivals away.',
    'Откроются рынок и дополнительные испытания.': 'Unlocks the market and extra challenges.',
    'Забери ветки у дальнего прилавка. Пройди через метку у канала и доставь их домой. Взлёт помогает против ветра.': 'Collect twigs at the far stall, pass the canal marker and bring them home. Flying helps against the wind.',
    'В стаю вступит курьер Рыжик. С ним груз несут быстрее.': 'Rusty the courier joins your flock. He helps you carry cargo faster.',
    'Дождись открытия среднего прилавка, забери заказ и вернись. Две замеченные кражи сорвут операцию.': 'Wait for the middle stall to open, collect the order and return. Being spotted stealing twice will end the job.',
    'Дальше — выманивание дворника к двум меткам.': 'Next up: lure the sweeper to two markers.',
    'У каждой метки свистни дворнику и отойди. Он должен дойти до обеих меток. Затем вернись в гнездо.': 'Whistle at each marker, then move away. The sweeper must reach both markers. Then return to the nest.',
    'В стаю вступит Гром. Его крик на время отпугивает кота.': 'Thunder joins your flock. His call briefly scares the cat away.',
    'Позови двух голубей у прилавков. Проведи обоих через метку у канала и доведи до гнезда.': 'Recruit both pigeons near the stalls. Guide them through the canal marker, then lead them to the nest.',
    'Откроется общий налёт с разведкой, спасением и тяжёлым грузом.': 'Unlocks a team heist with scouting, a rescue and heavy cargo.',
    'Открой задвижку слева, освободи голубя, затем унеси большой ящик из правого прилавка. Нужны два союзника.': 'Open the left latch, free the pigeon, then carry away the large crate from the right stall. You need two allies.',
    'Все заказы открыты. Улучшай рекорды и пробуй испытания.': 'All jobs are unlocked. Beat your records and try the challenges.',
    'Соперники быстрее. Займи три точки с союзником. Стая и взлёт помогут оторваться.': 'Rivals move faster. Claim three spots with an ally. Use your flock and flight to get away.',
    'Рекорд сохраняется. Награда выдаётся за первое прохождение.': 'Your best time is saved. The reward is awarded on your first completion.',
    'Рекорд сохраняется. Наградада за первое прохождение.': 'Your best time is saved. The reward is awarded on your first completion.',
    'Рекорд сохраняется. Награда за первое прохождение.': 'Your best time is saved. The reward is awarded on your first completion.',
    'Тележка движется быстрее, ветер сильнее. Забери ветки, пройди метку и вернись.': 'The cart moves faster and the wind is stronger. Collect the twigs, pass the marker and return.',
    'Дворник идёт быстрее. Вымани его к обеим меткам и вернись домой.': 'The sweeper moves faster. Lure him to both markers and return home.',
    'ОПЕРАЦИЯ ВЫПОЛНЕНА': 'JOB COMPLETE',
    'ОПЕРАЦИЯ СОРВАЛАСЬ': 'JOB FAILED',
    'Заказ выполнен!': 'Job complete!',
    'Кот перехватил!': 'Caught by the cat!',
    'Соперник перехватил!': 'A rival caught you!',
    'Слишком много шума!': 'Too much noise!',
    'Дворник догнал!': 'The sweeper caught you!',
    'Когда кот приседает, резко меняй направление.': 'When the cat crouches, change direction sharply.',
    'Отвлеки противника стаей или используй взлёт.': 'Distract the threat with your flock or take flight.',
    'Одна порция в гнезде. Нужна ещё одна!': 'One portion in the nest. Bring one more!',
    'Дворник засёк налёт! Уноси лапы.': 'The sweeper spotted the theft! Run!',
    'Прохожий поднял шум. Дворник идёт сюда!': 'A passer-by raised the alarm. The sweeper is coming!',
    'Кто-то возмущён! Неси добычу в гнездо.': 'Someone is upset! Get the loot to the nest.',
    'Чисто сработано! Неси добычу в гнездо.': 'A clean job! Get the loot to the nest.',
    'Картошка на столиках. Подойди ближе.': 'The fries are on the tables. Move closer.',
    'Добыча в клюве. Отнеси её в гнездо слева внизу.': 'You have the loot. Bring it to the nest at the bottom left.',
    'Соперник отступает. Занимай точку!': 'The rival is backing off. Claim the spot!',
    'Гром отпугнул кота. Проходи!': 'Thunder scared the cat away. Go!',
    'Подкрепление! У столика нажми «Стая» ещё раз.': 'Reinforcements! Press “Flock” again near a table.',
    'Стая летит к столику. Подбирайся к картошке!': 'Your flock is heading to the table. Sneak up to the fries!',
    'Подойди к любому голубю и позови его.': 'Move near a pigeon and call it.',
    'Стая переводит дух.': 'Your flock is catching its breath.',
    'Подойди ближе к столику с картошкой.': 'Move closer to a table with fries.',
    'Они смотрят на стаю. Сейчас!': 'They are watching your flock. Now!',
    'Метка пройдена. Следующая точка или домой.': 'Marker reached. Head to the next one or go home.',
    'Дворник потерял след.': 'The sweeper lost your trail.',
    'Кот присел. Резко меняй направление!': 'The cat is crouching. Change direction!',
    'Коснись площади или веди голубя джойстиком.': 'Tap the square or use the joystick to move.',
    'Гнездо рядом. Оставь порцию.': 'The nest is close. Drop off your food.',
    'Неси картошку в гнездо слева внизу.': 'Carry the fries to the nest at the bottom left.',
    'Картошка рядом. Жми «Украсть».': 'Fries within reach. Press “Steal”.',
    'Голубь рядом. Позови его кнопкой «Стая».': 'A pigeon is nearby. Press “Flock” to recruit it.',
    'Найди две порции картошки. Гнездо слева внизу.': 'Find two portions of fries. The nest is at the bottom left.',
    'Прилавок закрыт. Дождись зелёной метки.': 'The stall is closed. Wait for the green marker.',
    'Для захвата точки нужен союзник.': 'You need an ally to claim this spot.',
    'Удерживай место рядом с флажком.': 'Hold your position beside the flag.',
    'Подойди к незанятому флажку.': 'Move to a flag you have not claimed.',
    'Дворник идёт на свист. Отойди с его пути!': 'The sweeper heard your whistle. Get out of his way!',
    'Свистни у метки. Потом отойди в сторону.': 'Whistle beside a marker, then step aside.',
    'Задвижка открыта. Теперь освободи своего.': 'The latch is open. Now free your friend.',
    'Сначала открой задвижку у левого прилавка.': 'Open the latch by the left stall first.',
    'Свободен! Доведи его до гнезда.': 'Free at last! Lead him to the nest.',
    'Замок поддаётся. Клюнь ещё раз.': 'The lock is weakening. Peck it again.',
    'Доведи освобождённого голубя до гнезда.': 'Lead the freed pigeon to the nest.',
    'Подойди к клетке у кафе.': 'Move to the cage by the cafe.',
    'Собери обоих, проведи через метку, затем вернись домой.': 'Gather both pigeons, pass the marker, then return home.',
    'Сначала пройди через отмеченную точку.': 'Pass through the marked spot first.',
    'Сначала отвлеки людей стаей у столика.': 'Distract the people at the table with your flock first.',
    'Для большого ящика нужны два союзника и открытая клетка.': 'You need two allies and an open cage to carry the large crate.',
    'Груз в клюве. Следуй к метке и возвращайся домой.': 'Cargo collected. Follow the marker and return home.',
    'Тележка! Обойди её или перелети.': 'A cart! Go around it or fly over.',
    'Отметка получена. Теперь в гнездо!': 'Checkpoint reached. Return to the nest!',
    'Все прошли. Веди стаю домой.': 'Everyone made it through. Lead your flock home.'
  };

  Object.assign(messages,{"Пройди через зелёную метку.": "Pass through the green checkpoint.", "Груз в клюве. Возвращайся в гнездо.": "Cargo collected. Return to the nest.", "Укради две порции и принеси в гнездо.": "Steal two portions and bring them home.", "Отвлеки людей стаей у левого столика.": "Distract people at the left table with your flock.", "Забери письмо у кафе слева.": "Collect the letter by the cafe on the left.", "Доведи спасённого голубя до гнезда.": "Lead the rescued bird to the nest.", "Открой клетку тремя ударами клюва.": "Peck the cage lock three times.", "Займи три флажка вместе с союзником.": "Claim three flags with an ally.", "Забери ветки у правого прилавка.": "Collect twigs from the right stall.", "Средний прилавок открывается по зелёной метке.": "The middle stall opens when its sign turns green.", "Оба обхода выполнены. Возвращайся домой.": "Both checkpoints cleared. Return home.", "Свистни у метки и отойди с пути.": "Whistle at a marker, then step aside.", "Веди обоих голубей домой.": "Lead both birds home.", "Позови двух голубей и проведи через метку.": "Recruit both birds and lead them through the marker.", "Открой задвижку слева.": "Open the latch on the left.", "Освободи своего из клетки.": "Free your friend from the cage.", "Собери двух союзников и забери большой ящик.": "Gather two allies and collect the large crate."});
  Object.assign(messages,{'НА СВИСТ':'INVESTIGATING'});
  Object.assign(messages,{'Золото':'Gold','Серебро':'Silver','Бронза':'Bronze','Испытания':'Challenges'});
  Object.assign(messages,{'Выполнено':'Completed'});
  let language = 'ru';
  try {
    if (localStorage.getItem('pigeon-mafia-language') === 'en') language = 'en';
  } catch {}

  const originalTitle = document.title;
  const savedText = new WeakMap();
  const savedAttributes = new WeakMap();
  const textNodes = [];
  const attributeNodes = [];
  const dynamicAreas = [
    '.mission', '.wallet', 'output', '#tip', '#action-label', '#flock-label',
    '#ability', '#result-label', '#result-title', '#result-text', '#reward',
    '#save-error', '#order-list', '#order-title', '#order-intro', '#order-unlock',
    '#continue-label', '#continue-job', '#roof-progress', '#city-progress', '#chapter-progress', '#district-nav',
    '#field-note', '#pc-action', '#pc-flock', '#pc-flight',
    '#order-record', '#flock-progress', '#upgrade-list', '#purchase-note'
  ].join(',');

  function translate(source) {
    if (typeof source !== 'string' || language === 'ru') return source;
    const trimmed = source.trim();
    let translated = messages[trimmed];
    if (translated === undefined) {
      const count = trimmed.match(/^(ОТВЛЕЧЬ ·|В СТАЕ ·|ВЗЛЁТ|ОПЕРАЦИЯ)\s*(\d+)$/);
      if (count) {
        const label = count[1] === 'ОПЕРАЦИЯ' ? 'OPERATION' : messages[count[1]];
        translated = label + ' ' + count[2];
      }
    }
    if (translated === undefined) return source;
    return source.slice(0, source.indexOf(trimmed)) + translated +
      source.slice(source.indexOf(trimmed) + trimmed.length);
  }

  function apply() {
    for (const node of textNodes) {
      if (node.isConnected) node.nodeValue = translate(savedText.get(node));
    }
    for (const element of attributeNodes) {
      if (!element.isConnected) continue;
      for (const [name, value] of savedAttributes.get(element)) {
        element.setAttribute(name, translate(value));
      }
    }
    document.documentElement.lang = language;
    document.title = translate(originalTitle);
    const selector = document.getElementById('language');
    if (selector) selector.value = language;
  }

  function capture() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,noscript,option,' + dynamicAreas)) continue;
      if (!node.nodeValue.trim() || savedText.has(node)) continue;
      savedText.set(node, node.nodeValue);
      textNodes.push(node);
    }
    for (const element of document.querySelectorAll('[aria-label],[title]')) {
      if (savedAttributes.has(element)) continue;
      const attributes = new Map();
      for (const name of ['aria-label', 'title']) {
        if (element.hasAttribute(name)) attributes.set(name, element.getAttribute(name));
      }
      savedAttributes.set(element, attributes);
      attributeNodes.push(element);
    }
    apply();
  }

  function set(next) {
    if (next !== 'ru' && next !== 'en') return;
    language = next;
    try { localStorage.setItem('pigeon-mafia-language', language); } catch {}
    apply();
    window.dispatchEvent(new Event('language-changed'));
  }

  window.T = translate;
  window.I18N = Object.freeze({ language: () => language, set, capture });
})();
