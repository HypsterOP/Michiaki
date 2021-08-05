const execAll = () => {
  if (RegExp.prototype.hasOwnProperty('execAll')) {
    return console.error('RegExp prototype already includes a value for execAll.  Not overwriting it.');
  }

  return RegExp.prototype.execAll = RegExp.prototype = function * execAll(str) {
    if (!this.global) {
      console.error('RegExp must have the global flag to retrieve multiple results.');
    }

    let match;
    while (match = this.exec(str)) {
      yield match;
    }
  };
};

execAll();

const includesOf = () => {
  if (String.prototype.hasOwnProperty('includesOf')) {
    return console.error('String prototype already includes a value for includesOf.  Not overwriting it.');
  }

  return String.prototype.includesOf = function (arrays) {
    if (!Array.isArray(arrays)) {
      throw new Error('includesOf only accepts an array');
    }

    return arrays.some(str => this.toLowerCase().includes(str));
  };
};

includesOf();

const includesAll = () => {
  if (String.prototype.hasOwnProperty('includesAll')) {
    return console.error('String prototype already includes a value for includesAll.  Not overwriting it.');
  }

  return String.prototype.includesAll = function (arrays) {
    if (!Array.isArray(arrays)) {
      throw new Error('includesAll only accepts an array');
    }

    return arrays.every(str => this.toLowerCase().includes(str));
  };
};

includesAll();