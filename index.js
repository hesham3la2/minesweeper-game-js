const levels = {
  easy: {
    rows: 9,
    cols: 9,
    numOfMines: 10,
    timeout: 10,
  },
};

let selectedLevel;
let timer;
let board;
let gameover = false;

function stepDown() {
  if (gameover) return;
  if (timer === 0) {
    document.querySelector('.emoji').innerHTML = '💩';
    document.querySelector('.board').classList.add('freeze');
    return;
  }

  setTimeout(() => {
    timer--;
    document.querySelector('.timer span').innerHTML = timer;
    stepDown();
  }, 1000);
}

function checkStatus() {
  const cellElements = document.querySelector('.board').children;
  const cells = Array.from(cellElements);
  const hasClosedCell = cells.some((cell) => {
    const id = cell.id.substring(5);
    return !cell.classList.contains('selected') && board[id] !== 9;
  });
  if (hasClosedCell) return;
  document.querySelector('.board').classList.add('freeze');
  document.querySelector('.emoji').innerHTML = '😎';
  gameover = true;
}

function openCell(e) {
  const openEmptyNeigbours = (id) => {
    const neighbours = getNeighbours(id);
    neighbours.forEach((neighbour) => {
      const ele = document.getElementById(`cell-${neighbour}`);
      if (ele.classList.contains('selected')) return;

      const value = board[neighbour];
      ele.classList.add('selected', 'freeze', value && `c-${value}`);
      ele.innerHTML = value || '';

      if (!value) openEmptyNeigbours(neighbour);
    });
  };

  const element = e.target.nodeName === 'I' ? e.target.parentElement : e.target;
  if (element.classList.contains('flagged')) return;

  const value = board[+element.id.substring(5)];
  switch (value) {
    case 9:
      document.querySelector('.board').classList.add('freeze');
      element.style.backgroundColor = '#6c6c6c';
      board.forEach((val, i) => {
        if (val === 9) {
          const cell = document.getElementById(`cell-${i}`);
          if (!cell.classList.contains('flagged'))
            cell.innerHTML = '<i class="fa-solid fa-bomb"></i>';
        }
      });

      document.querySelector('.emoji').innerHTML = '💩';
      gameover = true;

      return;

    case 0:
      element.classList.add('selected', 'freeze');
      element.innerHTML = '';
      openEmptyNeigbours(+element.id.substring(5));
      break;

    default:
      element.classList.add('selected', 'freeze', `c-${value}`);
      element.innerHTML = value;
      break;
  }

  checkStatus();

  if (selectedLevel.timeout === timer) {
    stepDown();
  }
}

function toggleFlag(e) {
  const element = e.target.nodeName === 'I' ? e.target.parentElement : e.target;
  if (element.classList.contains('flagged')) {
    element.classList.remove('flagged');
    element.innerHTML = '';
    document.querySelector('.flags span').innerHTML =
      parseInt(document.querySelector('.flags span').innerHTML) + 1;
  } else {
    element.classList.add('flagged');
    element.innerHTML = '<i class="fas fa-flag" ></i>';
    document.querySelector('.flags span').innerHTML =
      parseInt(document.querySelector('.flags span').innerHTML) - 1;
  }
}

function render() {
  let elements = [];
  timer = selectedLevel.timeout;

  for (let i = 0; i < board.length; i++) {
    const element = document.createElement('span');
    element.id = `cell-${i}`;
    element.classList.add('cell', 'noselect');
    element.oncontextmenu = toggleFlag;
    element.onclick = openCell;
    elements.push(element);
  }

  const boardElement = document.querySelector('.board');
  boardElement.className = 'board';
  boardElement.innerHTML = '';
  boardElement.append(...elements);
  document.querySelector('.main').oncontextmenu = (e) => e.preventDefault();
  document.querySelector('.flags span').innerHTML = selectedLevel.numOfMines;
  document.querySelector('.emoji').innerHTML = '🤔';
  document.querySelector('.timer span').innerHTML = timer;
}

function getNeighbours(i) {
  const neighbours = [];
  const noLeft = !(i % selectedLevel.cols);
  const noRight = i % selectedLevel.cols === selectedLevel.cols - 1;
  const noUP = !Math.floor(i / selectedLevel.cols);
  const noDown = Math.floor(i / selectedLevel.cols) === selectedLevel.rows - 1;

  if (!noUP) {
    let topMiddle = i - selectedLevel.cols;
    neighbours.push(topMiddle);
    !noLeft && neighbours.push(topMiddle - 1);
    !noRight && neighbours.push(topMiddle + 1);
  }

  if (!noDown) {
    let downMiddle = i + selectedLevel.cols;
    neighbours.push(downMiddle);
    !noLeft && neighbours.push(downMiddle - 1);
    !noRight && neighbours.push(downMiddle + 1);
  }

  !noLeft && neighbours.push(i - 1);
  !noRight && neighbours.push(i + 1);

  return neighbours;
}

function start(level) {
  selectedLevel = level || levels.easy;
  board = Array(selectedLevel.rows * selectedLevel.cols).fill(0);
  let mines = selectedLevel.numOfMines;

  while (mines) {
    const random = Math.floor(
      Math.random() * selectedLevel.rows * selectedLevel.cols
    );

    if (board[random] === 9) continue;

    mines--;
    board[random] = 9;

    const neighbours = getNeighbours(random);

    for (let i = 0; i < neighbours.length; i++) {
      const neighbour = neighbours[i];
      if (board[neighbour] !== 9) {
        board[neighbour]++;
      }
    }
  }
  render();
}
document.querySelector('.emoji').onclick = () => start();
start();
