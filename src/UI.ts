import * as Editor from "./Editor";
import * as Map from "./Map";

import grassYellowIcon from "./assets/icons/grass_yellow.png";
import grassWhiteIcon from "./assets/icons/grass_white.png";

import * as Core from "./engine/Core";

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
	<div class="ui-left">
		<!-- ${ButtonIcon("⏏️", "Close")} -->
		${ButtonIcon("🔧", "Move")}
		${ButtonIcon("➕", "Add")}
		${ButtonIcon("➖", "Remove")}
		<div class="ui-separator"></div>
		${ButtonImage(grassYellowIcon, "Block 1")}
		${ButtonImage(grassWhiteIcon, "Block 2")}
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
	blockWBtn: HTMLElement;

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

	// closeBtn.addEventListener("click", () => {})

	addBtn.addEventListener("click", HandleAddClick);
	moveBtn.addEventListener("click", HandleMoveClick);
	removeBtn.addEventListener("click", HandleRemoveClick);
	blockYBtn.addEventListener("click", HandleBlockYClick);
	blockWBtn.addEventListener("click", HandleBlockWClick);

	HandleAddClick(null);
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
		blockYBtn.classList.add("selected");
		blockWBtn.classList.remove("selected");
	}
}
function HandleBlockWClick(ev?: MouseEvent) {
	if (Editor.GetActiveBlock() != Map.CellType.BlockWhite) {
		Editor.SetActiveBlock(Map.CellType.BlockWhite);
		blockYBtn.classList.remove("selected");
		blockWBtn.classList.add("selected");
	}
}
