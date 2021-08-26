import * as Editor from "./Editor";
import * as Map from "./Map";

import grassYellowIcon from "./assets/icons/grass_yellow.png";
import grassWhiteIcon from "./assets/icons/grass_white.png";
import brickIcon from "./assets/icons/brick.png";
import moonIcon from "./assets/icons/moon.png";
import coinIcon from "./assets/icons/coin.png";
import enemyIcon from "./assets/icons/enemy.png";
import spawnIcon from "./assets/icons/spawn_point.png";
import heartIcon from "./assets/icons/heart.png";

import { GetMode, ToggleMode } from "./main";

const SEEN_HELP_COOKIE = "seen_help=";

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
		<div class="ui-collectable" id="ui-lives"></div>
		<div class="ui-collectable" id="ui-coins"></div>
		<div class="ui-collectable" id="ui-moons"></div>
	</div>
	<div class="ui-left ui-editor">
		<button class="circle-btn" id="help-btn">?</button>
		<span class="ui-spacer"></span>
		<input id="file-input" type="file" name="name" style="display: none;" />
		${ButtonIcon("📥", "Save")}
		${ButtonIcon("📤", "Load")}
		<div class="ui-separator"></div>
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
	<div class="ui-right">
		<button class="circle-btn" id="play-btn">&#9658;</button>
	</div>
</div>
`;

let container: HTMLDivElement;

let addBtn: HTMLElement,
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
	filePicker: HTMLInputElement,
	loadBtn: HTMLElement,
	livesDiv: HTMLElement,
	coinsDiv: HTMLElement,
	moonsDiv: HTMLElement,
	helpBtn: HTMLElement,
	startBtn: HTMLElement;

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

	livesDiv = document.getElementById("ui-lives");
	coinsDiv = document.getElementById("ui-coins");
	moonsDiv = document.getElementById("ui-moons");

	// Event listeners
	// const closeBtn = document.getElementById("close-btn");
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
	helpBtn = document.getElementById("help-btn");
	startBtn = document.getElementById("start-btn");
	filePicker = document.getElementById("file-input") as HTMLInputElement;
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
	removeBtn.addEventListener("click", HandleRemoveClick);
	saveBtn.addEventListener("click", HandleSaveClick);
	loadBtn.addEventListener("click", HandleLoadClick);
	playBtn.addEventListener("click", HandlePlayClick);
	filePicker.addEventListener("change", HandleFileChosen);
	helpBtn.addEventListener("click", HandleHelpClick);
	startBtn.addEventListener("click", HandleHelpClick);
	for (let i = 0; i < elementBtns.length; i++) {
		elementBtns[i].addEventListener("click", elementCallbacks[i]);
	}

	if (document.cookie.indexOf(SEEN_HELP_COOKIE) == -1) {
		HandleHelpClick();
	}

	HandleAddClick(null);
}

function DeselectAllElements() {
	elementBtns.forEach((e) => e.classList.remove("selected"));
}

function HandleAddClick(ev?: MouseEvent) {
	if (Editor.editMode != "ADD") {
		Editor.SetEditMode("ADD");
		addBtn.classList.add("selected");
		removeBtn.classList.remove("selected");
	}
}
function HandleRemoveClick(ev?: MouseEvent) {
	if (Editor.editMode != "REMOVE") {
		Editor.SetEditMode("REMOVE");
		addBtn.classList.remove("selected");
		removeBtn.classList.add("selected");
	}
}
function HandleBlockYClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.BlockYellow) {
		Editor.SetActiveBlock(Map.CellType.BlockYellow);
		DeselectAllElements();
		blockYBtn.classList.add("selected");
	}
}
function HandleBlockWClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.BlockWhite) {
		Editor.SetActiveBlock(Map.CellType.BlockWhite);
		DeselectAllElements();
		blockWBtn.classList.add("selected");
	}
}
function HandleBrickClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.Brick) {
		Editor.SetActiveBlock(Map.CellType.Brick);
		DeselectAllElements();
		brickBtn.classList.add("selected");
	}
}
function HandleMoonClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.Moon) {
		Editor.SetActiveBlock(Map.CellType.Moon);
		DeselectAllElements();
		moonBtn.classList.add("selected");
	}
}
function HandleCoinClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.Coin) {
		Editor.SetActiveBlock(Map.CellType.Coin);
		DeselectAllElements();
		coinBtn.classList.add("selected");
	}
}
function HandleEnemyClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.Enemy) {
		Editor.SetActiveBlock(Map.CellType.Enemy);
		DeselectAllElements();
		enemyBtn.classList.add("selected");
	}
}
function HandleSpawnClick(ev?: MouseEvent) {
	HandleAddClick(null);
	if (Editor.GetActiveBlock() != Map.CellType.Spawn) {
		Editor.SetActiveBlock(Map.CellType.Spawn);
		DeselectAllElements();
		spawnBtn.classList.add("selected");
	}
}

function HandlePlayClick() {
	ToggleMode();
}

function HandleSaveClick() {
	Editor.ExportMap();
}
function HandleLoadClick() {
	filePicker.value = "";
	filePicker.click();
}
function HandleFileChosen(event: Event) {
	const fileList = (<HTMLInputElement>event.target).files;
	fileList[0].text().then(Editor.ImportMap);
}

export function HandleHelpClick() {
	let hide = document.getElementById("help-ui").classList.toggle("hidden");
	if (hide) {
		document.cookie = SEEN_HELP_COOKIE;
	}
}

export function HandleLivesChanged(lives: number) {
	livesDiv.innerHTML = `<img src="${heartIcon}" alt="❤"><span>×${lives}</span>`;
}
export function HandleCoinsChanged(coins: number) {
	coinsDiv.innerHTML = `<img src="${coinIcon}" alt="🪙"><span>×${coins}</span>`;
}
export function HandleMoonsChanged(moons: number) {
	moonsDiv.innerHTML = `<img src="${moonIcon}" alt="🌙"><span>×${moons}</span>`;
}

export function ToggleUIMode() {
	playBtn.innerHTML = GetMode() === "EDITOR" ? "&#9658;" : "&#9632;";
	document
		.querySelectorAll(".ui-editor")
		.forEach((e) => e.classList.toggle("hidden"));
	document
		.querySelectorAll(".ui-game")
		.forEach((e) => e.classList.toggle("hidden"));
}
