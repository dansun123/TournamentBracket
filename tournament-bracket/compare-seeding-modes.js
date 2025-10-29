// This script demonstrates the difference between the two seeding modes

console.log('SEEDING MODE COMPARISON\n');
console.log('=======================\n');

console.log('With 8 players (power of 2):');
console.log('----------------------------');
console.log('Traditional Seeding:');
console.log('  Match 1: Player 1 vs Player 8');
console.log('  Match 2: Player 2 vs Player 7');
console.log('  Match 3: Player 3 vs Player 6');
console.log('  Match 4: Player 4 vs Player 5');
console.log('  (1 seed plays 8 seed, 2 plays 7, etc.)\n');

console.log('Top Seeds Get Byes:');
console.log('  Match 1: Player 1 vs Player 2');
console.log('  Match 2: Player 3 vs Player 4');
console.log('  Match 3: Player 5 vs Player 6');
console.log('  Match 4: Player 7 vs Player 8');
console.log('  (Sequential pairing)\n');

console.log('\nWith 6 players (not power of 2):');
console.log('--------------------------------');
console.log('Traditional Seeding:');
console.log('  Match 1: Player 1 vs BYE (top seed gets bye)');
console.log('  Match 2: Player 2 vs BYE (2nd seed gets bye)');
console.log('  Match 3: Player 3 vs Player 6');
console.log('  Match 4: Player 4 vs Player 5\n');

console.log('Top Seeds Get Byes:');
console.log('  Match 1: Player 1 vs Player 2');
console.log('  Match 2: Player 3 vs Player 4');
console.log('  Match 3: Player 5 vs Player 6');
console.log('  Match 4: BYE vs BYE (byes at end)');
console.log('  (Byes are placed at the end of the bracket)\n');
