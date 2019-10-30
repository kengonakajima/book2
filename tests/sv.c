#include <stdio.h>
#include <arpa/inet.h> // inet_pton
#include <errno.h> // errno
#include <string.h> // strerror
#include <unistd.h> // read/write

#ifdef __APPLE__
#include <netinet/tcp.h>
void print_window_size(int fd) {
    struct tcp_connection_info info;
    int length = sizeof(info);
    getsockopt(fd, IPPROTO_TCP, TCP_CONNECTION_INFO, (void *)&info, (socklen_t *)&length);
    fprintf(stderr, "TCP sndw:%d rcvw:%d rttcur:%d rttvar:%d\n",info.tcpi_snd_wnd, info.tcpi_rcv_wnd,
            info.tcpi_rttcur, info.tcpi_rttvar );
}
#endif






int main() {
    int svfd=socket(AF_INET,SOCK_STREAM,0);
    struct sockaddr_in addr;
    addr.sin_family=AF_INET;
    addr.sin_port=htons(22222);
    int ret=inet_pton(AF_INET,"0.0.0.0",&addr.sin_addr.s_addr);
    if(ret<0) { fprintf(stderr,"inet_pton error:%s\n",strerror(errno)); return 1; }
    ret=setsockopt(svfd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));
    if(ret<0) { fprintf(stderr, "setsockopt error:%s\n",strerror(errno)); return 1;}
    ret=bind(svfd,(struct sockaddr*)&addr, sizeof(struct sockaddr_in));
    if(ret<0) { fprintf(stderr,"bind error:%s\n",strerror(errno)); return 1; }
    ret=listen(svfd,5);
    if(ret<0) { fprintf(stderr,"listen error:%s\n",strerror(errno)); return 1; }
    struct sockaddr_in peer_addr;
    socklen_t peer_addr_len;
    int peerfd=accept(svfd, (struct sockaddr *)&peer_addr, &peer_addr_len);
    if(peerfd<0) { fprintf(stderr,"accept error:%s\n",strerror(errno)); return 1;}
    fprintf(stderr, "accepted\n");
    while(1) {
        char buf[100];
        ret=read(peerfd,buf,100);
        if(ret>0) {
            print_window_size(peerfd);
            ret=write(peerfd,buf,ret);
        } else {
            break;
        }
    }
    close(peerfd);
    return 0;
}

