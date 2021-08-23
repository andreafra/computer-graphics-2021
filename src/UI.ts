import * as Editor from "./Editor";
import * as Map from "./Map";

import grassYellowIcon from "./assets/icons/grass_yellow.png";
import grassWhiteIcon from "./assets/icons/grass_white.png";
import brickIcon from "./assets/icons/brick.png";
import moonIcon from "./assets/icons/moon.png";
import coinIcon from "./assets/icons/coin.png";
import enemyIcon from "./assets/icons/enemy.png";
import spawnIcon from "./assets/icons/spawn_point.png";

import { ToggleMode } from "./main";

const ButtonIcon = (
	icon: string,
	label: string
) => `<button class="ui-button" id="${label
	.toLowerCase()
	.replace(" ", "-")}-btn">
${icon}<br><span class="ui-label">${label}</span>
</button>`;

const ButtonImage = (
	image: string,
	label: string
) => `<button class="ui-button" id="${label
	.toLowerCase()
	.replace(" ", "-")}-btn">
<img src="${image}" alt="${label}" /><br><span class="ui-label">${label}</span>
</button>`;

const contentHtml = `<!-- HTML Added by UI.ts -->
<div class="ui-flex">
	<div class="ui-left ui-game hidden">
		<div class="ui-lives">❤ ❤ ❤</div>
	</div>
	<div class="ui-left ui-editor">
		<!-- ${ButtonIcon("⏏️", "Close")} -->
		${ButtonIcon("🔧", "Move")}
		${ButtonIcon("➕", "Add")}
		${ButtonIcon("➖", "Remove")}
		<div class="ui-separator"></div>
		${ButtonImage(grassYellowIcon, "Block 1")}
		${ButtonImage(grassWhiteIcon, "Block 2")}
		${ButtonImage(brickIcon, "Brick")}
		${ButtonImage(moonIcon, "Moon")}
		${ButtonImage(coinIcon, "Coin")}
		${ButtonImage(enemyIcon, "Enemy")}
		${ButtonImage(spawnIcon, "Spawn")}
	</div>
	<div class="ui-left ui-editor">
		<div class="ui-separator"></div>
		<input id="file-input" type="file" name="name" style="display: none;" />
		${ButtonIcon("📥", "Save")}
		${ButtonIcon("📤", "Load")}
		<div class="ui-separator"></div>
	</div>
	<div class="ui-right">
		<button class="ui-button" id="play-btn">▶️</button>
	</div>
</div>
`;

let container: HTMLDivElement;

let moveBtn: HTMLElement,
	addBtn: HTMLElement,
	removeBtn: HTMLElement,
	blockYBtn: HTMLElement,
	blockWBtn: HTMLElement,
	brickBtn: HTMLElement,
	moonBtn: HTMLElement,
	coinBtn: HTMLElement,
	enemyBtn: HTMLElement,
	spawnBtn: HTMLElement,
	playBtn: HTMLElement,
	saveBtn: HTMLElement,
	filePicker: HTMLElement,
	loadBtn: HTMLElement;

let elementBtns: HTMLElement[] = [];
const elementCallbacks = [
	HandleBlockWClick,
	HandleBlockYClick,
	HandleBrickClick,
	HandleMoonClick,
	HandleCoinClick,
	HandleEnemyClick,
	HandleSpawnClick,
];

export function Init() {
	container = document.getElementById("main-ui") as HTMLDivElement;
	container.innerHTML = contentHtml;

	// Event listeners
	// const closeBtn = document.getElementById("close-btn");
	moveBtn = document.getElementById("move-btn");
	addBtn = document.getElementById("add-btn");
	removeBtn = document.getElementById("remove-btn");
	blockYBtn = document.getElementById("block-1-btn");
	blockWBtn = document.getElementById("block-2-btn");
	brickBtn = document.getElementById("brick-btn");
	moonBtn = document.getElementById("moon-btn");
	coinBtn = document.getElementById("coin-btn");
	enemyBtn = document.getElementById("enemy-btn");
	spawnBtn = document.getElementById("spawn-btn");
	playBtn = document.getElementById("play-btn");
	loadBtn = document.getElementById("load-btn");
	saveBtn = document.getElementById("save-btn");
	filePicker = document.getElementById("file-input");
	// closeBtn.addEventListener("click", () => {})

	elementBtns = [
		blockWBtn,
		blockYBtn,
		brickBtn,
		moonBtn,
		coinBtn,
		enemyBtn,
		spawnBtn,
	];

	addBtn.addEventListener("click", HandleAddClick);
	moveBtn.addEventListener("click", HandleMoveClick);
	removeBtn.addEventListener("click", HandleRemoveClick);
	saveBtn.addEventListener("click", HandleSaveClick);
	loadBtn.addEventListener("click", HandleLoadClick);
	playBtn.addEventListener("click", HandlePlayClick);
	filePicker.addEventListener("change", HandleFileChosen);

	for (let i = 0; i < elementBtns.length; i++) {
		elementBtns[i].addEventListener("click", elementCallbacks[i]);
	}

	HandleAddClick(null);
}

function DeselectAllElements() {
	elementBtns.forEach((e) => e.classList.remove("selected"));
}

function HandleMoveClick(ev?: MouseEvent) {
	if (Editor.editMode != "MOVE") {
		Editor.SetEditMode("MOVE");
		moveBtn.classList.add("selected");
		addBtn.classList.remove("selected");
		removeBtn.classList.remove("selected");
	}
}
function HandleAddClick(ev?: MouseEvent) {
	if (Editor.editMode != "ADD") {
		Editor.SetEditMode("ADD");
		moveBtn.classList.remove("selected");
		addBtn.classList.add("selected");
		removeBtn.classList.remove("selected");
	}
}
function HandleRemoveClick(ev?: MouseEvent) {
	if (Editor.editMode != "REMOVE") {
		Editor.SetEditMode("REMOVE");
		moveBtn.classList.remove("selected");
		addBtn.classList.remove("selected");
		removeBtn.classList.add("selected");
	}
}
function HandleBlockYClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.BlockYellow) {
		Editor.SetActiveBlock(Map.CellType.BlockYellow);
		DeselectAllElements();
		blockYBtn.classList.add("selected");
	}
}
function HandleBlockWClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.BlockWhite) {
		Editor.SetActiveBlock(Map.CellType.BlockWhite);
		DeselectAllElements();
		blockWBtn.classList.add("selected");
	}
}
function HandleBrickClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.Brick) {
		Editor.SetActiveBlock(Map.CellType.Brick);
		DeselectAllElements();
		brickBtn.classList.add("selected");
	}
}
function HandleMoonClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.Moon) {
		Editor.SetActiveBlock(Map.CellType.Moon);
		DeselectAllElements();
		moonBtn.classList.add("selected");
	}
}
function HandleCoinClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.Coin) {
		Editor.SetActiveBlock(Map.CellType.Coin);
		DeselectAllElements();
		coinBtn.classList.add("selected");
	}
}
function HandleEnemyClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.Enemy) {
		Editor.SetActiveBlock(Map.CellType.Enemy);
		DeselectAllElements();
		enemyBtn.classList.add("selected");
	}
}
function HandleSpawnClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.Spawn) {
		Editor.SetActiveBlock(Map.CellType.Spawn);
		DeselectAllElements();
		spawnBtn.classList.add("selected");
	}
}

function HandlePlayClick() {
	let mode = ToggleMode();
	playBtn.innerText = mode === "EDITOR" ? "▶️" : "■";

	document
		.querySelectorAll(".ui-editor")
		.forEach((e) => e.classList.toggle("hidden"));
	document
		.querySelectorAll(".ui-game")
		.forEach((e) => e.classList.toggle("hidden"));
}

function HandleSaveClick() {
	Editor.ExportMap();
}
function HandleLoadClick() {
	filePicker.click();
}
async function HandleFileChosen(event: Event) {
	const fileList = (<HTMLInputElement>event.target).files;
	fileList[0].text().then(Editor.ImportMap);
}
