#include "effects.h"
#include <stdint.h>
#include <fftw3.h>

// #define BUFFER_ARGS const s16* buffer, const BufferInfo* bufferInfo, const size_t idx

fftw_plan forward_plan = NULL;
fftw_plan backwards_plan = NULL;
fftw_complex* amplitudes = NULL;

f64 max(f64 a, f64 b) {
	return a > b ? a : b;
}

// The default reverb provided by digipedal
void reverb_digi(BUFFER_ARGS, u8 width) {
	// if (forward_plan == NULL) {
	// 	forward_plan = fftw_plan_dft_r2c_1d(bufferInfo->length, buffer, amplitudes, FFTW_ESTIMATE);
	// 	amplitudes = fftw_alloc_complex(bufferInfo->length/2+1);
	// }

	// // Reverb takes the current sample, and adds a scaled version of the previous
	// // sample to it at a lower amplitude. The scaling factor is `width`.
	// const s16 MAX_WIDTH = INT16_MAX;
	// const s16 MIN_WIDTH = INT16_MAX;
}

// distortion is just multiply by scalar and clamp at max value
void delay_digi(BUFFER_ARGS, u16 time, u8 strength) {
	const s16 MAX_WIDTH = INT16_MAX;
	const s16 MIN_WIDTH = INT16_MIN;

	buffer[idx] += ((buffer[idx-time] * strength) >> 8);
}

// strength is on a scale from 0 to 1.
void distort_digi(BUFFER_ARGS, f32 strength) {
	// const f64 MAX_AMPLITUDE = INT16_MAX;
	// const f64 MIN_AMPLITUDE = INT16_MIN;
	// strength += 1.0;
	// if (forward_plan == NULL) {
	// 	forward_plan = fftw_plan_dft_r2c_1d(48000, buffer-48000, amplitudes, FFTW_ESTIMATE);
	// 	amplitudes = fftw_alloc_complex(48000/2+1);
	// 	backwards_plan = fftw_plan_dft_c2r_1d(48000, amplitudes, buffer, FFTW_ESTIMATE);
	// }
	// fftw_execute_dft_r2c(forward_plan, buffer, amplitudes);
	// for (size_t i = 0; i < 48000/2+1; i++) {
	// 	buffer[i] = max(buffer[i]*strength, MAX_AMPLITUDE);
	// }
	// fftw_execute_dft_c2r(backwards_plan, amplitudes, buffer);
}