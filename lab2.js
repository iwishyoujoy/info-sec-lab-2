"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeys = generateKeys;
exports.extendKey = extendKey;
exports.shiftLeft = shiftLeft;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.encodeDecryptedBlocks = encodeDecryptedBlocks;
exports.encryptBlock = encryptBlock;
exports.sBoxes = sBoxes;
exports.splitIntoSBoxes = splitIntoSBoxes;
exports.decryptBlock = decryptBlock;
exports.splitIntoBlocks = splitIntoBlocks;
exports.splitIntoBlocksBits = splitIntoBlocksBits;
exports.combineBlocks = combineBlocks;
exports.permute = permute;
exports.convertBytesIntoBitsArray = convertBytesIntoBitsArray;
exports.convertNumberIntoString = convertNumberIntoString;
exports.xor = xor;
var fs = require("fs");
// fs.writeFile('./decrypted.txt', decrypted, (err) => {
//     if (err) {
//         console.error("Error writing output file:", err);
//     } else {
//         console.log(`File successfully decrypted and saved`);
//     }
// });
var ADDED_POSITIONS = [7, 15, 23, 31, 39, 47, 55, 63];
var KEY_SHIFT = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
var CD = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4,
];
var KEY2 = [
    14, 17, 11, 24, 1, 5, 3, 28,
    15, 6, 21, 10, 23, 19, 12, 4,
    26, 8, 16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55, 30, 40,
    51, 45, 33, 48, 44, 49, 39, 56,
    34, 53, 46, 42, 50, 36, 29, 32
];
var IP = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
];
var FP = [
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25
];
var P = [
    16, 7, 20, 21,
    29, 12, 28, 17,
    1, 15, 23, 26,
    5, 18, 31, 10,
    2, 8, 24, 14,
    32, 27, 3, 9,
    19, 13, 30, 6,
    22, 11, 4, 25
];
var E = [
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1
];
var S1 = [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
];
var S2 = [
    [15, 1, 8, 14, 5, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
];
var S3 = [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
];
var S4 = [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
];
var S5 = [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
];
var S6 = [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
];
var S7 = [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
];
var S8 = [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
];
var S_BOXES = {
    1: S1,
    2: S2,
    3: S3,
    4: S4,
    5: S5,
    6: S6,
    7: S7,
    8: S8
};
var IV = [
    1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0,
    1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1,
    0, 0, 0, 0
];
var keys = generateKeys('1t345g7');
function generateKeys(key) {
    var extendedKey = extendKey(key);
    var cdKey = permute(extendedKey, CD);
    // Ключа на части C и D для получения остальных ключей
    var left = cdKey.slice(0, 28);
    var right = cdKey.slice(28);
    var keys = [];
    // Получаем 16 ключей путем циклического сдига влево
    for (var round = 0; round < 16; round++) {
        left = shiftLeft(left, KEY_SHIFT[round]);
        right = shiftLeft(right, KEY_SHIFT[round]);
        var combined = __spreadArray(__spreadArray([], left, true), right, true);
        var permutedCombinedKey = permute(combined, KEY2);
        keys.push(permutedCombinedKey);
    }
    return keys;
}
/**
 * Функция для преобразования начального ключа из 56 бит или 7 байт (в данном случае 7 символо ASCII).
 * В позиции 7, 15, 23, 31, 39, 47, 55, 63 добавляются биты таким образом, чтобы каждый байт содержал нечетное количество единиц.
 * @param key - ключ из 7 символом ascii
 */
function extendKey(key) {
    var keyLettersEncoded = new TextEncoder().encode(key);
    var result = [];
    var keyBits = convertBytesIntoBitsArray(keyLettersEncoded);
    var j = 0;
    var prevByte = [];
    for (var i = 0; i < keyBits.length; i++) {
        if (ADDED_POSITIONS.includes(j)) {
            var countOnes = prevByte.filter(function (item) { return item === 1; }).length;
            if (countOnes % 2 == 0) {
                result.push(1);
            }
            else {
                result.push(0);
            }
            prevByte = [];
            i--;
            j++;
            continue;
        }
        prevByte.push(keyBits[i]);
        result.push(keyBits[i]);
        j++;
    }
    if (ADDED_POSITIONS.includes(j)) {
        var countOnes = prevByte.filter(function (item) { return item === 1; }).length;
        if (countOnes % 2 == 0) {
            result.push(1);
        }
        else {
            result.push(0);
        }
    }
    return result;
}
/**
 * Функция циклического сдвига влево
 * @param arr - биты
 * @param bits - порядок сдвигов, то есть количество, насколько надо сдвинуть биты за раз
 */
function shiftLeft(arr, bits) {
    var shiftedArr = new Array(arr.length);
    var actualBits = bits % arr.length;
    for (var i = 0; i < arr.length; i++) {
        shiftedArr[(i - actualBits + arr.length) % arr.length] = arr[i];
    }
    return shiftedArr;
}
/**
 * Функция шифрования методом DES в режиме шифрования PCBC
 * @param data
 */
function encrypt(data) {
    var blocks = splitIntoBlocks(data);
    var encryptedBlocks = [];
    var c = IV;
    var m = IV;
    blocks.forEach(function (block, index) {
        var bitsBlock = convertBytesIntoBitsArray(block);
        var xorBlock;
        if (index === 0) {
            xorBlock = xor(bitsBlock, IV);
        }
        else {
            xorBlock = xor(bitsBlock, xor(c, m));
        }
        var encryptedBlock = encryptBlock(xorBlock);
        c = encryptedBlock;
        m = bitsBlock;
        encryptedBlocks.push(encryptedBlock);
    });
    return combineBlocks(encryptedBlocks);
}
/**
 * Функция расшифровки методом DES в режиме шифрования PCBC
 * @param ciphertext
 */
function decrypt(ciphertext) {
    var blocks = splitIntoBlocksBits(ciphertext);
    var decryptedBlocks = [];
    var c = IV;
    var m = IV;
    blocks.forEach(function (block, index) {
        var decryptedBlock = decryptBlock(block);
        var xorBlock;
        if (index === 0) {
            xorBlock = xor(decryptedBlock, IV);
        }
        else {
            xorBlock = xor(decryptedBlock, xor(c, m));
        }
        c = block;
        m = xorBlock;
        decryptedBlocks.push(xorBlock);
    });
    var flattenedArray = decryptedBlocks.flat();
    return encodeDecryptedBlocks(flattenedArray);
}
/**
 * Перевод битов в исходные символы для расшированных блоков данных
 * @param data
 */
function encodeDecryptedBlocks(data) {
    var blockSize = 8;
    var asciiNumbers = [];
    for (var i = 0; i < data.length; i += blockSize) {
        var num = data.slice(i, i + blockSize).join('');
        asciiNumbers.push(parseInt(num, 2));
    }
    var buffer = new Uint8Array(asciiNumbers);
    return new TextDecoder().decode(buffer);
}
/**
 * Функция шифрования блока длинною 64 бита
 * @param block
 */
function encryptBlock(block) {
    // Начальная перестановка
    var permutedBlock = permute(block, IP);
    // Разделение на левую и правую части
    var left = permutedBlock.slice(0, 32);
    var right = permutedBlock.slice(32);
    var prevRight = right;
    for (var round = 0; round < 16; round++) {
        // Функция расширения Е - работает таким образом, что 32-битный вектор R расширяется до 48-битного вектора Е
        // путем дублирования некоторых битов
        var expandedRight = permute(right, E);
        var xoredKey = xor(expandedRight, keys[round]);
        var sBoxOutput = sBoxes(xoredKey);
        var rightNew = xor(left, sBoxOutput);
        left = prevRight;
        right = rightNew;
        prevRight = rightNew;
    }
    // Объединение левой и правой частей
    var combined = __spreadArray(__spreadArray([], left, true), right, true);
    // Финальная перестановка
    return permute(combined, FP);
}
/**
 * Функция преобразования по S таблицам
 * @param input
 */
function sBoxes(input) {
    var splitInput = splitIntoSBoxes(input);
    var result = [];
    splitInput.forEach(function (item, index) {
        var a = parseInt((String(item[0]) + String(item[5])), 2);
        var b = parseInt((String(item[1]) + String(item[2]) + String(item[3]) + String(item[4])), 2);
        var sBoxesOutput = convertNumberIntoString(S_BOXES[index + 1][a][b]);
        var sBoxesOutputArray = sBoxesOutput.split('');
        sBoxesOutputArray.forEach(function (bit) {
            result.push(Number(bit));
        });
    });
    var permutedResult = permute(result, P);
    return permutedResult;
}
/**
 * Вспомогательная фунция для разбения по 6 битов - для преобразования с S таблицами
 * @param input
 */
function splitIntoSBoxes(input) {
    var blockSize = 6;
    var blocks = [];
    for (var i = 0; i < input.length; i += blockSize) {
        var block = input.slice(i, i + blockSize);
        blocks.push(block);
    }
    return blocks;
}
/**
 * Функция для расшифровки блока длинною 64 бита
 * @param block
 */
function decryptBlock(block) {
    // Начальная перестановка
    var permuteBlock = permute(block, IP);
    // Разделение на левую и правую части
    var left = permuteBlock.slice(0, 32);
    var right = permuteBlock.slice(32);
    var prevLeft = left;
    for (var round = 15; round >= 0; round--) {
        // Функция расширения Е - работает таким образом, что 32-битный вектор R расширяется до 48-битного вектора Е
        // путем дублирования некоторых битов
        var expandedLeft = permute(left, E);
        var xoredKey = xor(expandedLeft, keys[round]);
        var sBoxOutput = sBoxes(xoredKey);
        var leftNew = xor(right, sBoxOutput);
        right = prevLeft;
        left = leftNew;
        prevLeft = leftNew;
    }
    // Объединение левой и правой частей
    var combined = __spreadArray(__spreadArray([], left, true), right, true);
    // Финальная перестановка
    return permute(combined, FP);
}
/**
 * Функция для разбивания блоков данных, состоящих из байтов, на массивы по 8 байт
 * @param data
 */
function splitIntoBlocks(data) {
    var blockSize = 8;
    var blocks = [];
    for (var i = 0; i < data.length; i += blockSize) {
        var block = data.slice(i, i + blockSize);
        if (block.length < blockSize) {
            // Дополнение последнего блока нулями
            var paddedBlock = new Uint8Array(blockSize);
            paddedBlock.set(block);
            blocks.push(paddedBlock);
        }
        else {
            blocks.push(block);
        }
    }
    return blocks;
}
/**
 * Функция для разбивания данных на блоки по 64 бита
 * @param data
 */
function splitIntoBlocksBits(data) {
    var blockSize = 64;
    var blocks = [];
    for (var i = 0; i < data.length; i += blockSize) {
        var block = data.slice(i, i + blockSize);
        while (block.length < blockSize) {
            block.push(0);
        }
        blocks.push(block);
    }
    return blocks;
}
/**
 * Вспомогательная функция для соединения получившихся блоков
 * @param blocks
 */
function combineBlocks(blocks) {
    return blocks.flat();
}
/**
 * Функция перестановки по указанном таблице
 * @param input - блок данных, который необходимо переставить
 * @param table - таблица, по которой будет выполнена перестановка
 */
function permute(input, table) {
    var output = new Array(table.length);
    for (var i = 0; i < table.length; i++) {
        var index = table[i] - 1;
        output[i] = input[index];
    }
    return output;
}
/**
 * Функция для данных представленных в виде массива байтов. Переводит их в двоичный вид, представляет в виде битов.
 * @param data
 */
function convertBytesIntoBitsArray(data) {
    var bits = [];
    data.forEach(function (byte) {
        var bit = convertNumberIntoString(byte);
        var bitArray = bit.split('');
        bitArray.forEach(function (element) {
            bits.push(Number(element));
        });
    });
    return bits;
}
/**
 * Вспомогательная функция для получения двоичного представления числа.
 * Дополняет нули до 8 знаков.
 * @param num
 */
function convertNumberIntoString(num) {
    var twoish = num.toString(2);
    var result = twoish;
    for (var i = twoish.length; i < 8; i++) {
        result = '0' + result;
    }
    return result;
}
/**
 * Функция XOR. Подаются массивы битов
 * @param a
 * @param b
 */
function xor(a, b) {
    return a.map(function (val, i) { return val ^ b[i]; });
}
function encryptFromFile() {
    fs.readFile('./input.txt', 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading input file:", err);
            return;
        }
        var encrypted = encrypt(new TextEncoder().encode(data));
        var encryptedFileContent = encodeDecryptedBlocks(encrypted);
        fs.writeFile('./encrypted.txt', encryptedFileContent, function (err) {
            if (err) {
                console.error("Error writing output file:", err);
            }
        });
        var decrypted = decrypt(encrypted);
        console.log(decrypted);
    });
}
encryptFromFile();
