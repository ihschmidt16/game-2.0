
export function inputs(phrazePuz) {

let BOXROWS0, BOXCOLS0;
// CONSTANTS
if (window.innerHeight < window.innerWidth) {
    BOXROWS0 = 30;     // number of box rows
    BOXCOLS0 = 20;    // number of box cols
} else {
    BOXROWS0 = 30;     // number of box rows
    BOXCOLS0 = 12;    // number of box cols
}

// Function to create a 2D array
function create2DArray(rows, cols) {
    let array = [];
    for (let i = 0; i < rows; i++) {
        array.push(new Array(cols).fill(0));
    }
    return array;
}

// Function to set set_arr and calculate BOXCOLS and BOXROWS
function calculateSetArr(together_list, BOXCOLS0) {
    let set_arr = create2DArray(BOXROWS0, BOXCOLS0);
    let cur_row = 0;
    let cur_col = 0;
    let final_col = 0;

    together_list.forEach(word => {
        if (word.length >= BOXCOLS0 - cur_col + 1) {
            if (cur_col > final_col) final_col = cur_col - 1;
            cur_row++;
            cur_col = 0;
        }
        for (let lett = 0; lett < word.length; lett++) {
            if (cur_row == 0) final_col = cur_col;
            set_arr[cur_row][cur_col] = word[lett];
            if (cur_col > final_col) final_col = cur_col - 1;
            cur_col++;
        }
        cur_col++;
        if (cur_row == 0) final_col = cur_col - 1;
        if (cur_col > final_col) final_col = cur_col - 1;
    });

    return { set_arr, BOXCOLS: final_col, BOXROWS: cur_row + 1 };
}

// Function to set str_arr
function fillStrArr(set_arr, BOXROWS, BOXCOLS) {
    let str_arr = create2DArray(BOXROWS, BOXCOLS);
    set_arr.forEach((row, rowIndex) => {
        row.forEach((char, colIndex) => {
            if (char !== 0) {
                str_arr[rowIndex][colIndex] = char;
            }
        });
    });
    return str_arr;
}

// Function to set num_arr, first_lins, last_lins, underline1, and underline2
function calculateNumArrAndIndices(separated_list, BOXROWS, BOXCOLS) {
    let num_arr = create2DArray(BOXROWS, BOXCOLS);
    let cur_row = 0;
    let cur_col = 0;
    let indication_idx = 0;
    let last_lins1 = [];
    let first_lins1 = [];
    let underline1_1 = [[0, 0]];
    let on_first_lett = false;

    separated_list.forEach(word => {
        let num_indicators = (word.match(/-/g) || []).length;
        if (!word.includes("-")) {
            if (word.length >= BOXCOLS - cur_col + 1) {
                cur_row++;
                cur_col = 0;
            }
            for (let lett = 0; lett < word.length; lett++) {
                num_arr[cur_row][cur_col] = 1;
                cur_col++;
                if (on_first_lett) {
                    first_lins1.push([cur_row, cur_col - 1]);
                    on_first_lett = false;
                }
            }
        } else {
            if (word.length - num_indicators >= BOXCOLS - cur_col + 1) {
                cur_row++;
                cur_col = 0;
            }
            for (let lett = 0; lett < word.length; lett++) {
                if (on_first_lett && lett !== word.length - 1) {
                    first_lins1.push([cur_row, cur_col]);
                    on_first_lett = false;
                }
                if (word[lett] == "-") {
                    indication_idx++;
                    if (indication_idx % 2 === 0) {
                        last_lins1.push([cur_row, cur_col - 1]);
                        on_first_lett = true;
                    }
                    if (indication_idx == 1) {
                        first_lins1.push([cur_row, cur_col]);
                    }
                    if (indication_idx % 2 !== 0) {
                        underline1_1.push([cur_row, cur_col]);
                    }
                } else {
                    if (indication_idx % 2 === 0) {
                        num_arr[cur_row][cur_col] = 1;
                    } else {
                        num_arr[cur_row][cur_col] = 2;
                    }
                    cur_col++;
                }
                if (on_first_lett && lett !== word.length - 1) {
                    first_lins1.push([cur_row, cur_col]);
                    on_first_lett = false;
                }
            }
        }
        cur_col++;
    });

    let last_lin_idx = (BOXROWS * BOXCOLS) - 1;
    while (num_arr[Math.floor(last_lin_idx / BOXCOLS)][last_lin_idx % BOXCOLS] === 0) {
        last_lin_idx--;
    }
    last_lins1.push([Math.floor(last_lin_idx / BOXCOLS), last_lin_idx % BOXCOLS]);

    let underline2_1 = last_lins1;
    let underline1 = underline1_1.map(([row, col]) => BOXCOLS * row + col);
    let underline2 = underline2_1.map(([row, col]) => BOXCOLS * row + col);

    let first_lins = first_lins1.map(([row, col]) => BOXCOLS * row + col);
    first_lins[0] = 0;
    let last_lins = last_lins1.map(([row, col]) => BOXCOLS * row + col);

    return { num_arr, first_lins, last_lins, underline1, underline2 };
}

// Function to set guess_arr
function fillGuessArr(str_arr, BOXROWS, BOXCOLS, first_lins) {
    let guess_arr = create2DArray(BOXROWS, BOXCOLS);
    for (let i = 0; i < first_lins[0]; i++) {
        let row = Math.floor(i / BOXCOLS);
        let col = i % BOXCOLS;
        guess_arr[row][col] = str_arr[row][col];
    }
    return guess_arr;
}

// CALCS
const separated_list = phrazePuz.split(" ");
const together_str = phrazePuz.replace(/-/g, "");
const together_list = together_str.split(" ");

const { set_arr, BOXCOLS, BOXROWS } = calculateSetArr(together_list, BOXCOLS0);
const str_arr = fillStrArr(set_arr, BOXROWS, BOXCOLS);
const {
    num_arr,
    first_lins,
    last_lins,
    underline1,
    underline2
} = calculateNumArrAndIndices(separated_list, BOXROWS, BOXCOLS);
const guess_arr = fillGuessArr(str_arr, BOXROWS, BOXCOLS, first_lins);

const num_arrX = num_arr.flat();
const str_arrX = str_arr.flat();
const guess_arrX = guess_arr.flat();


// EXPORTS
return { BOXROWS, BOXCOLS, last_lins, first_lins, underline1, underline2, num_arrX, str_arrX, guess_arrX };

}
