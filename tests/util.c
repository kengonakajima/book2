#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <sys/time.h> // gettimeofday

#include "util.h"


double now() {
    struct timeval tmv;
    gettimeofday( &tmv, NULL );
    return tmv.tv_sec  + (double)(tmv.tv_usec) / 1000000.0f;
}
