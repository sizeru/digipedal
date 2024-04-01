#include "effects.h"
#include <stdint.h>
#include <fftw3.h>

// #define BUFFER_ARGS const u16* buffer, const size_t bufferSize, const size_t idx

// Maybe reverb and delay 

// The default reverb provided by digipedal
void reverb_digi(BUFFER_ARGS, u8 width) {
	// static fftwf_plan plan = fftwf_plan_dft_r2c_1d(bufferInfo->length, 

	// Reverb takes the current sample, and adds a scaled version of the previous
	// sample to it at a lower amplitude. The scaling factor is `width`.
	const s16 MAX_WIDTH = INT16_MAX;
	const s16 MIN_WIDTH = INT16_MAX;

	buffer[idx] += ((buffer[idx-1] * width) >> 8);
}

// distortion is just multiply by scalar and clamp at max value
void delay_digi(BUFFER_ARGS, u16 time, u8 strength) {
	const s16 MAX_WIDTH = INT16_MAX;
	const s16 MIN_WIDTH = INT16_MAX;

	buffer[idx] += ((buffer[idx-time] * strength) >> 8);
}