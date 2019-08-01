.POSIX:

.DEFAULT_GOAL := all
all: images ui operator product_info
.PHONY: all

# Use this empty target to force execution of a rule
FORCE:

include VERSION
VERSION_FULL = \
	$(VERSION_MAJOR).$(VERSION_MINOR).$(VERSION_PATCH)$(VERSION_SUFFIX)

PWD := $(shell pwd)

PRODUCT_NAME ?= ExampleSolution
PRODUCT_LOWERNAME ?= example-solution

# Destination paths
BUILD_ROOT ?= $(PWD)/_build
ISO_ROOT ?= $(BUILD_ROOT)/root
IMAGES_ROOT = $(ISO_ROOT)/images
ISO ?= $(BUILD_ROOT)/$(PRODUCT_LOWERNAME)-$(VERSION_FULL).iso

# Source paths
IMAGES_SRC ?= $(PWD)/images
UI_SRC ?= $(PWD)/ui
OPERATOR_SRC ?= $(PWD)/example-operator

# Binary paths and options
DOCKER ?= docker
DOCKER_OPTS ?=
HARDLINK ?= hardlink
OPERATOR_SDK ?= operator-sdk
OPERATOR_SDK_OPTS ?=
SKOPEO ?= skopeo
SKOPEO_OPTS ?= --override-os linux --insecure-policy
REGISTRY_SCRIPT ?= \
	$(PWD)/static-container-registry/static-container-registry.py


# Container images {{{

# Images are either defined under `images/<name>/`, or in the UI and Operator
# sources.
# UI and Operator images deserve special treatment and are thus handled
# separately.
STD_IMAGES := $(notdir $(wildcard $(IMAGES_SRC)/*))

# Image targets and their order of execution is controlled using indicator
# files stored in `_build/images/<image_name>/`.
# A `.built` file is touched on time of build, and `.saved` on time of save.
_built_tgt = $(BUILD_ROOT)/images/$(1)/.built
_saved_tgt = $(BUILD_ROOT)/images/$(1)/.saved

images: build_images save_images dedup_images gen_registry_config
.PHONY: images

# Build container images
build_images: build_ui build_operator build_std_images
.PHONY: build_images

# Build UI image
UI_IMG_NAME ?= $(PRODUCT_LOWERNAME)-ui
UI_BUILD_TARGET = $(call _built_tgt,$(UI_IMG_NAME))
build_ui: $(UI_BUILD_TARGET)
.PHONY: build_ui

$(UI_BUILD_TARGET): $(UI_SRC)/Dockerfile
	@echo Building UI image "$(UI_IMG_NAME):$(VERSION_FULL)"...
	@mkdir -p $(@D)
	docker build -t $(UI_IMG_NAME):$(VERSION_FULL) $(<D)
	@touch $@
	@echo Built UI image.

# Build Operator image
OPERATOR_IMG_NAME ?= $(PRODUCT_LOWERNAME)-operator
OPERATOR_BUILD_TARGET = $(call _built_tgt,$(OPERATOR_IMG_NAME))

build_operator: $(OPERATOR_BUILD_TARGET)
.PHONY: build_operator

# TODO: find a way to define requisites for this task
$(OPERATOR_BUILD_TARGET):
	@echo Building Operator image "$(OPERATOR_IMG_NAME):$(VERSION_FULL)"...
	@mkdir -p $(@D)
	cd $(OPERATOR_SRC) && \
		$(OPERATOR_SDK) $(OPERATOR_SDK_OPTS) build \
		$(OPERATOR_IMG_NAME):$(VERSION_FULL)
	@touch $@
	@echo Built Operator image.

# Build other images
STD_BUILD_TARGETS = $(foreach img,$(STD_IMAGES),$(call _built_tgt,$(img)))
build_std_images: $(STD_BUILD_TARGETS)
.PHONY: build_std_images

$(BUILD_ROOT)/images/%/.built: $(IMAGES_SRC)/%/Dockerfile
	@echo Building component image "$*:$(VERSION_FULL)"
	@mkdir -p $(@D)
	$(DOCKER) $(DOCKER_OPTS) build -t $*:$(VERSION_FULL) $(<D)
	@touch $@
	@echo Built all component images.


# Save images as layers with skopeo
ALL_IMG_NAMES = $(STD_IMAGES) $(OPERATOR_IMG_NAME) $(UI_IMG_NAME)
IMG_SAVE_TARGETS = $(foreach img,$(ALL_IMG_NAMES),$(call _saved_tgt,$(img)))

save_images: $(IMG_SAVE_TARGETS) | build_images
.PHONY: save_images

$(IMAGES_ROOT)/%:
	mkdir -p $@

$(BUILD_ROOT)/images/%/.saved: $(BUILD_ROOT)/images/%/.built | $(IMAGES_ROOT)/%
	@echo Saving image "$*:$(VERSION_FULL)"...
	@mkdir -p $(@D)
	$(SKOPEO) $(SKOPEO_OPTS) copy \
		--format v2s2 --dest-compress \
		docker-daemon:$*:$(VERSION_FULL) \
		dir:$(IMAGES_ROOT)/$*/$(VERSION_FULL)
	@touch $@
	@echo Saved all images.

# Deduplicate image layers with hardlink
dedup_images: $(BUILD_ROOT)/images/.deduplicated | save_images
.PHONY: dedup_images

$(BUILD_ROOT)/images/.deduplicated: $(IMG_SAVE_TARGETS)
	@echo Deduplicating image layers...
	$(HARDLINK) -c $(IMAGES_ROOT)
	@touch $@
	@echo Deduplicated image layers.


# Generate image registry config for NGINX with a custom script
gen_registry_config: $(ISO_ROOT)/registry-config.inc.j2 | dedup_images
.PHONY: gen_registry_config

$(ISO_ROOT)/registry-config.inc.j2: $(BUILD_ROOT)/images/.deduplicated
	@echo Generating NGINX registry configuration...
	$(REGISTRY_SCRIPT) \
		--name-prefix '{{ repository }}' \
		--server-root '{{ registry_root }}' \
		$(IMAGES_ROOT) > $@
	@echo Generated NGINX registry configuration.


# }}}
# Files to copy into the build tree {{{

# UI manifests
UI_MANIFESTS := $(wildcard $(UI_SRC)/deploy/*.yaml)
UI_TARGETS := $(subst $(UI_SRC)/deploy,$(ISO_ROOT)/ui,$(UI_MANIFESTS))

ui: $(UI_TARGETS)
.PHONY: ui

$(ISO_ROOT)/ui/%.yaml: $(UI_SRC)/deploy/%.yaml
	@echo Render $< into $@.
	@mkdir -p $(@D)
	@sed -e 's/@VERSION@/$(VERSION_FULL)/' -e 's/@REPOSITORY@/$(TODO)/' $< > $@

# Operator manifests
OPERATOR_MANIFESTS := $(wildcard \
	$(OPERATOR_SRC)/deploy/*.yaml \
	$(OPERATOR_SRC)/deploy/crds/*.yaml \
)
OPERATOR_TARGETS := \
	$(subst $(OPERATOR_SRC),$(ISO_ROOT)/operator,$(OPERATOR_MANIFESTS))

operator: $(OPERATOR_TARGETS)
.PHONY: operator

$(ISO_ROOT)/operator/%: $(OPERATOR_SRC)/%
	@echo Copy "$<" to "$@".
	@mkdir -p $(@D)
	@rm -f $@
	@cp -a $< $@

# Product information
product_info: $(ISO_ROOT)/product.txt
.PHONY: product_info

$(ISO_ROOT)/product.txt: $(PWD)/product.sh $(PWD)/VERSION FORCE
	@echo Generate "product.txt".
	@rm -f $@
	@mkdir -p $(@D)
	@env \
		NAME=$(PRODUCT_NAME) \
		VERSION_MAJOR=$(VERSION_MAJOR) \
		VERSION_MINOR=$(VERSION_MINOR) \
		VERSION_PATCH=$(VERSION_PATCH) \
		VERSION_SUFFIX=$(VERSION_SUFFIX) \
		$< > $@ || (rm -f $@; false)


# }}}
# Generate ISO archive {{{

iso: $(ISO)
.PHONY: iso

# Since product.txt is generated every time, we don't need explicit requisites
# for this ISO generation - it will happen every time. We leave the `all`
# target handle generation of the ISO contents.
$(ISO): all
	mkisofs -output $@ \
		-quiet \
		-rock \
		-joliet \
		-joliet-long \
		-full-iso9660-filenames \
		-volid "$(PRODUCT_NAME) $(VERSION_FULL)" \
		--iso-level 3 \
		-gid 0 \
		-uid 0 \
		-input-charset utf-8 \
		-output-charset utf-8 \
		$(ISO_ROOT)
	cd $$(dirname $@) && sha256sum $(notdir $@) > SHA256SUM


# }}}