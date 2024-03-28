CC = gcc
EXEC = synth
SRCS = synth.c effects.c 

synth: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} -Ofast

debug: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} -O0 -g3

clean:
	rm -f ${EXEC}