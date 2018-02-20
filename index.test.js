import TimeDuration from './index';

/* globals describe, it, expect */

describe('TimeDuration', () => {

	it('the class should be instantiated', () => {
		const td = new TimeDuration();
		expect(typeof td === 'object').toBeTruthy();
	});

	describe('constructor', () => {
		it('should accept an empty arg', () => {
			const td = new TimeDuration();
			expect(td._minutes).toBe(0);
		});
		it('should accept a number as minutes at input', () => {
			const td = new TimeDuration(102);
			expect(td._minutes).toBe(102);
		});
		it('should accept a negative number as minutes at input', () => {
			const td = new TimeDuration(-102);
			expect(td._minutes).toBe(-102);
		});
		it('should accept a TimeDuration at input', () => {
			const td = new TimeDuration(new TimeDuration(102));
			expect(td._minutes).toBe(102);
		});
		it('should accept string as HH:MM at input', () => {
			const td1 = new TimeDuration('1:42');
			expect(td1._minutes).toBe(102);
			const td2 = new TimeDuration('01:1');
			expect(td2._minutes).toBe(61);
			const td3 = new TimeDuration('-10:30');
			expect(td3._minutes).toBe(-630);
			const td4 = new TimeDuration('-00:30');
			expect(td4._minutes).toBe(-30);
			const td5 = new TimeDuration('- 1:30');
			expect(td5._minutes).toBe(-90);
			const td6 = new TimeDuration('');
			expect(td6._minutes).toBe(0);
		});
		it('should accept an obj {hours,minutes} at input', () => {
			const td1 = new TimeDuration({});
			expect(td1._minutes).toBe(0);
			const td2 = new TimeDuration({ hours: 1, minutes: 42 });
			expect(td2._minutes).toBe(102);
			const td3 = new TimeDuration({ hours: '1', minutes: '42' });
			expect(td3._minutes).toBe(102);
			const td4 = new TimeDuration({ hours: -0, minutes: 10 });
			expect(td4._minutes).toBe(-10);
			const td5 = new TimeDuration({ hours: '-0', minutes: 10 });
			expect(td5._minutes).toBe(-10);
			const td6 = new TimeDuration({ hours: 1 });
			expect(td6._minutes).toBe(60);
			const td7 = new TimeDuration({ minutes: 60 });
			expect(td7._minutes).toBe(60);
			const td8 = new TimeDuration({ hours: 2, minutes: undefined });
			expect(td8._minutes).toBe(120);
		});
		it('should accept 2 numbers as (H, m) at input', () => {
			const td = new TimeDuration(1, 42);
			expect(td._minutes).toBe(102);
		});
		it('should accept 2 Date objects at input - and get the difference', () => {
			const date1 = new Date(2018, 0, 1, 12, 45, 54, 1234);
			const date2 = new Date(2018, 0, 1, 14, 20, 15, 8576);
			const td = new TimeDuration(date1, date2);
			expect(td._minutes).toBe(94);
		});
		it('should return error on invalid string', () => {
			expect(() => (new TimeDuration('hours:minutes'))).toThrowError();
		});
		it('should error on invalid number on object', () => {
			expect(() => (new TimeDuration({ hours: 'blabla', minutes: 10 }))).toThrowError();
		});
	});

	describe('conversion', () => {
		const td = new TimeDuration(102);
		it('should evaluate duration as minutes', () => {
			expect(td.valueOf()).toBe(102);
		});
		it('should return time as minutes', () => {
			expect(td.toMinutes()).toBe(102);
		});
		describe('should return time as hours', () => {
			const td130 = new TimeDuration(130);
			const td60 = new TimeDuration(60);
			it('without any parameter', () => {
				expect(td130.toHours()).toBe(2.17);
				expect(td60.toHours()).toBe(1);
			});
			it('withouth decimals', () => {
				expect(td130.toHours(0)).toBe(2);
				expect(td60.toHours(0)).toBe(1);
			});
		});
		describe('should return time as object {hours, minutes}', () => {
			it('for normal positive time', () => {
				expect(td.toObject()).toEqual({ hours: 1, minutes: 42 });
			});
			it('for negative time', () => {
				const tdNegative = new TimeDuration(-62);
				expect(tdNegative.toObject()).toEqual({ hours: -1, minutes: -2 });
			});
		});
		describe('should return time as string HH:MM', () => {
			it('with minutes lower than 10', () => {
				const td2 = new TimeDuration(62);
				expect(td2.toString()).toBe('1:02');
			});
			it('with minutes grather than 10', () => {
				expect(td.toString()).toBe('1:42');
			});
			it('with negative value for time', () => {
				const td2 = new TimeDuration(-62);
				expect(td2.toString()).toBe('-1:02');
			});
			it('without any parameter', () => {
				expect(td.toString(true)).toBe('01:42');
			});
		});
	});

	describe('getters and setters', () => {
		const td = new TimeDuration(80);
		describe('get', () => {
			it('hours should return hours', () => {
				expect(td.hours).toBe(1);
			});
			it('minutes should return minutes', () => {
				expect(td.minutes).toBe(20);
			});
		});
		describe('set', () => {
			it('hours should change only hours', () => {
				td.hours = 2;
				expect(td.toString()).toBe('2:20');
			});
			it('minutes should change only minutes', () => {
				td.minutes = 2;
				expect(td.toString()).toBe('2:02');
			});
		});
	});

	describe('operations', () => {
		describe('sum', () => {
			it('should change current objct', () => {
				const td = new TimeDuration('21:21');
				td.add('01:00');
				expect(td.toMinutes()).toBe(1341);
			});
			it('should return the object', () => {
				const td = new TimeDuration('21:21');
				expect(td.add('01:00')).toEqual(td);
			});
		});
		describe('subtract', () => {
			it('should change current objct', () => {
				const td = new TimeDuration(102);
				const td2 = new TimeDuration(1, 0);
				td.subtract(td2);
				expect(td.toMinutes()).toBe(42);
				td.subtract(td2);
				expect(td.toMinutes()).toBe(-18); // idrk if this is the expected value.
			});
			it('should return the object', () => {
				const td = new TimeDuration(102);
				const td2 = new TimeDuration(1, 0);
				expect(td.subtract(td2)).toEqual(td);
			});
		});
		it('multiplyBy should change current objct', () => {
			const td = new TimeDuration(60);
			td.multiplyBy(3);
			expect(td.toMinutes()).toBe(180);
		});
		it('divideBy should change current objct', () => {
			const td = new TimeDuration(180);
			td.divideBy(3);
			expect(td.toMinutes()).toBe(60);
			td.divideBy(7);
			expect(td.toMinutes()).toBe(9);
		});
	});

});
