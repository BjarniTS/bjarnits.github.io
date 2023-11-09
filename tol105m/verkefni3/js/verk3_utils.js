function multi_array(cols, rows) {
  let arr = [];
  for(var i = 0; i < rows; ++i) 
    arr.push(Array(cols).fill(null));
  return arr;
}

function cr_to_xz(col, row) {
  let x = col + 0.5;
  let z = -row - 0.5;
  return [x, z];
}

function xz_to_cr(x, z) {
  // col = x - 0.5;
  // row = -z - 0.5;
  return [Math.floor(x), Math.floor(-z)]; 
}

function dist(x1, z1, x2, z2) {
  const xdist = (x2 - x1)**2;
  const zdist = (z2 - z1)**2;
  return Math.sqrt(xdist + zdist);
}