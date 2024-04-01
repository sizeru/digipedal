#include <portaudio.h>
#include "shorttypes.h"
#include <asm/unistd_64.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/mman.h>
#include "effects.h"
#include "wav.h"

#define EXEC_NAME "synth"

// Syscall to create a file (in RAM) which can be used for MMIO. Used to create
// a circular buffer. Created with help from
// https://lo.calho.st/posts/black-magic-buffer/ and
// https://benjamintoll.com/2022/08/21/on-memfd_create/#memfd_create
inline int memfd_create(const char* name, u32 flags) {
	return syscall(__NR_memfd_create, name, flags);
}

typedef enum u8 {
	CONFIG_OK,
	CONFIG_INVALID_EXEC_NAME
} UsageStatus;

typedef struct {
	size_t bufferSize;
} SynthConfig;

void initDefaultConfig(SynthConfig* config);
UsageStatus parseOptions(int argc, char* argv[], SynthConfig* config);
void printUsage();
s16 getInputAmplitude();
s16* initBuffer(size_t minSize, BufferInfo* bufferInfo);
PaStream* initPortAudio(int outputDeviceID, size_t sampleRate, PaStreamCallback* streamCallback);

// Start up the synthesizer and synth server
int main(int argc, char* argv[]) {
	SynthConfig config;
	initDefaultConfig(&config);
	if (CONFIG_OK != parseOptions(argc, argv, &config)) {
		printUsage();
		return -1;
	}

	// Create two buffers. One for the s16 input. One using floating point for FFTS.
	BufferInfo bufferInfo;
	s16* buffer = initBuffer(config.bufferSize, &bufferInfo);
	// s16 inputBuffer[bufferInfo.length];

	Wav wav = wavOpen("./tests/clean.wav"); 

	PaStream* stream;
	stream = initPortAudio(-1, wav.sampleRate, NULL);

	// Create an array of effects
	void(*effect[64])();
	u8 effectCount = 0;
	size_t maxEffects = sizeof(effect);
	// TODO(Nate): Everything after this is hardcoded right now. 
	effect[0] = (void(*)()) delay_digi;
	effectCount = 1;
	
	size_t idx = 0;
	if (paNoError != Pa_StartStream(stream)) {
		return -1;
	}
	while (1) {
		// inputBuffer[idx] = wavNext(&wav);
		buffer[idx] = wavNext(&wav); // convert to float
		for (int i = 0; i < effectCount; i++) {
			effect[i](buffer, &bufferInfo, idx, atoi(argv[2]), atoi(argv[3]));
		}
		// Write a single frame
		Pa_WriteStream(stream, &buffer[idx], 1);

		idx++;
		if (idx >= bufferInfo.length) { idx=0; }
	}

	// Currently unreachable
	Pa_StopStream(stream);
	Pa_CloseStream(stream);
	return 0;
}

void initDefaultConfig(SynthConfig* config) {
	config->bufferSize = MiB(500);
	return;
}

UsageStatus parseOptions(int argc, char* argv[], SynthConfig* config) {
	if (argc < 1) {
		puts("Recieved no arguments");
		return CONFIG_INVALID_EXEC_NAME;	
	}

	int opt;
	while ((opt = getopt(argc, argv, "m:")) != -1) {
		switch (opt) {
		case 'b': {
			config->bufferSize = atoi(optarg); // Convert to 
			break;
		}
		}
	}

	return CONFIG_OK;
}

void printUsage() {
	printf(
		"Usage:\n\t%s [-b buffer_size]\n",
		EXEC_NAME
	);
}

s16 getInputAmplitude() {

	// TODO: Read this input from I/O. For now, should probably read this input
	// from a file
	return 0;
}

s16* initBuffer(size_t minSizeInBytes, BufferInfo* bufferInfo) {
	// We will use circular buffers using virtual memory. So we need to round up
	// the size of the buffer to the nearest pagesize
	int pagesize = getpagesize();
	int bufferSize = ((minSizeInBytes + (pagesize-1)) & ~(pagesize-1)); // round up
	int bufferFD = memfd_create("circular_buffer", 0); // Files can be mapped to
	ftruncate(bufferFD, bufferSize); // expand filesize to buffer size 

	// Reserve chunks of virutal memory, and have them all point to the same file.
	// So we need to reserve 3*bufferSize contiguous addresses in virtual memory
	s16* buffer = mmap(NULL, 3 * bufferSize, PROT_NONE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
	size_t bufferLength = bufferSize/sizeof(*buffer);
	// Map all 3 virtual memory spans to the same file descriptor
	(void) mmap(buffer,                  bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);
	(void) mmap(buffer + bufferLength,   bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);
	(void) mmap(buffer + 2*bufferLength, bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);

	if (bufferInfo != NULL) {
		bufferInfo->fd = bufferFD;
		bufferInfo->length = bufferLength;
	}

	// return the middle buffer
	buffer = buffer + bufferLength;
	memset(buffer, 0, bufferSize);
	return buffer;
}

// Initialize the PortAudio API
PaStream* initPortAudio(int outputDeviceID, size_t sampleRate, PaStreamCallback* streamCallback) {
	if (outputDeviceID != -1) {
		printf("Selecting output device not implemented yet");
		return 0;
	}
	if (Pa_Initialize() != paNoError) {
		return 0;
	}
	PaStream* stream;
	if (paNoError != Pa_OpenDefaultStream(&stream, 0, 1, paInt16, sampleRate, paFramesPerBufferUnspecified, streamCallback, NULL)) {
		return 0;
	}
	return stream;
}