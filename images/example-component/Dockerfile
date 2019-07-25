# Base image configuration
# SHA256 digest of the image
ARG EXAMPLE_IMAGE_SHA256
ARG EXAMPLE_IMAGE=docker.io/centos


## Build container
FROM ${EXAMPLE_IMAGE}@sha256:${EXAMPLE_IMAGE_SHA256} as build

RUN yum -y update && yum clean all

RUN yum install -y \
        wget \
        git

ARG GO_VERSION=1.12.7

RUN wget https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C / -xzf go${GO_VERSION}.linux-amd64.tar.gz

ENV GOROOT=/go \
    GOPATH=/app

ENV PATH="${PATH}:${GOROOT}/bin"

RUN mkdir -p /app/src/prometheus && \
    git clone https://github.com/prometheus/client_golang.git \
        /app/src/prometheus/client_golang

WORKDIR /app/src/prometheus/client_golang/examples/random

ENV GO111MODULE=on
RUN GOPROXY=https://proxy.golang.org go get -d -v && \
    go build -v -o /bin/main


## Main container
FROM ${EXAMPLE_IMAGE}@sha256:${EXAMPLE_IMAGE_SHA256}

# Timestamp of the build, formatted as RFC3339
ARG BUILD_DATE
# Git revision of the tree at build time
ARG VCS_REF
# Version of the image
ARG VERSION
# Version of the project, e.g. `git describe --always --long --dirty --broken`
ARG PROJECT_VERSION

# These contain BUILD_DATE so should come 'late' for layer caching
LABEL maintainer="example@solution.com" \
      # http://label-schema.org/rc1/
      org.label-schema.build-date="$BUILD_DATE" \
      org.label-schema.name="example-component" \
      org.label-schema.description="Dummy component to demonstrate MetalK8s Solutions" \
      org.label-schema.url="https://github.com/example/solution/" \
      org.label-schema.vcs-url="https://github.com/example/solution.git" \
      org.label-schema.vcs-ref="$VCS_REF" \
      org.label-schema.vendor="Solution" \
      org.label-schema.version="$VERSION" \
      org.label-schema.schema-version="1.0" \
      org.label-schema.docker.cmd="docker run -listen-address :8080" \
      # https://github.com/opencontainers/image-spec/blob/master/annotations.md
      org.opencontainers.image.created="$BUILD_DATE" \
      org.opencontainers.image.authors="example@solution.com" \
      org.opencontainers.image.url="https://github.com/example/solution/" \
      org.opencontainers.image.source="https://github.com/example/solution.git" \
      org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.vendor="Solution" \
      org.opencontainers.image.title="example-component" \
      org.opencontainers.image.description="Dummy component to demonstrate MetalK8s Solutions" \
      # https://docs.openshift.org/latest/creating_images/metadata.html
      io.openshift.tags="metalk8s,solution,example" \
      io.k8s.description="Dummy component to demonstrate MetalK8s Solutions" \
      # Various
      com.solution.example.version="$PROJECT_VERSION"

COPY --from=build /bin/main /bin/main
ENTRYPOINT [ "/bin/main" ]
CMD [ "-listen-address", ":8080" ]
