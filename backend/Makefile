CC = gcc
EXEC = synth
SRCS = synth.c effects.c wav.c
LIBS = -lrt -lm -lasound -ljack -pthread
FFTW_SRC = fftw-3.3.10
PORTAUDIO_SRC = portaudio
LIBDIR = ./libs
DEPS = ${LIBDIR}/libportaudio.a ${LIBDIR}/libfftw3.a
INCLUDE_DIR = ./includes
INCLUDES = ${INCLUDE_DIR}/portaudio.h ${INCLUDE_DIR}/fftw3.h 
TEMP_FILES = tempfiles
DIR := ${CURDIR}

.PHONY: debug clean

synth: ${SRCS} ${DEPS} ${INCLUDES}
	${CC} -o ${EXEC} -I ${INCLUDE_DIR} ${SRCS} ${DEPS} -Ofast ${LIBS}

debug: ${SRCS} ${DEPS} ${INCLUDES}
	${CC} -o ${EXEC} -I ${INCLUDE_DIR} ${SRCS} ${DEPS} -Og -g3 ${LIBS}

clean:
	rm -f ${EXEC}
	rm -f ${DEPS}
	cd ${PORTAUDIO_SRC} && make clean
	rm -rf ${TEMP_FILES}
	rm -rf ${INCLUDE_DIR}


${LIBDIR}/libportaudio.a:
	mkdir -p ${LIBDIR}
	cd ${PORTAUDIO_SRC} && ./configure
	cd ${PORTAUDIO_SRC} && sed -i 's/\r//g' libtool
	cd ${PORTAUDIO_SRC} && make
	cp ${PORTAUDIO_SRC}/lib/.libs/libportaudio.a ${LIBDIR}/libportaudio.a

${INCLUDE_DIR}/portaudio.h:
	mkdir -p ${INCLUDE_DIR}
	cd ${PORTAUDIO_SRC} && ./configure
	cd ${PORTAUDIO_SRC} && sed -i 's/\r//g' libtool
	cd ${PORTAUDIO_SRC} && make
	cp ${PORTAUDIO_SRC}/include/portaudio.h ${INCLUDE_DIR}/portaudio.h

# Untar the file
${TEMP_FILES}/${FFTW_SRC}: ${FFTW_SRC}.tar.gz
	mkdir -p ${TEMP_FILES}
	tar -xf ${FFTW_SRC}.tar.gz -C ${TEMP_FILES}

# TODO Create a make for the libs themselves, rather than combining them 
# Create the makefile. The output of configuring.
${TEMP_FILES}/lib: ${TEMP_FILES}/${FFTW_SRC}
	mkdir -p ${LIBDIR}
	mkdir -p ${TEMP_FILES}/${FFTW_SRC}
	cd ${TEMP_FILES}/${FFTW_SRC} && ./configure --prefix ${DIR}/${TEMP_FILES}
	cd ${TEMP_FILES}/${FFTW_SRC} && make && make install

# Create the library
${LIBDIR}/libfftw3.a: ${TEMP_FILES}/lib
	mkdir -p ${LIBDIR}
	cp ${TEMP_FILES}/lib/libfftw3.a ${LIBDIR}

# Copy gcc flags from the library
${LIBDIR}/libfftw3.la: ${TEMP_FILES}/lib
	mkdir -p ${LIBDIR}
	cp ${TEMP_FILES}/lib/libfftw3.la ${LIBDIR}

${INCLUDE_DIR}/fftw3.h: ${TEMP_FILES}/lib
	mkdir -p ${INCLUDE_DIR}
	cp ${TEMP_FILES}/include/fftw3.h ${INCLUDE_DIR}
