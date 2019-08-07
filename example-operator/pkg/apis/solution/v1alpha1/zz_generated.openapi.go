// +build !ignore_autogenerated

// This file was autogenerated by openapi-gen. Do not edit it manually!

package v1alpha1

import (
	spec "github.com/go-openapi/spec"
	common "k8s.io/kube-openapi/pkg/common"
)

func GetOpenAPIDefinitions(ref common.ReferenceCallback) map[string]common.OpenAPIDefinition {
	return map[string]common.OpenAPIDefinition{
		"./pkg/apis/solution/v1alpha1.Example":       schema_pkg_apis_solution_v1alpha1_Example(ref),
		"./pkg/apis/solution/v1alpha1.ExampleSpec":   schema_pkg_apis_solution_v1alpha1_ExampleSpec(ref),
		"./pkg/apis/solution/v1alpha1.ExampleStatus": schema_pkg_apis_solution_v1alpha1_ExampleStatus(ref),
	}
}

func schema_pkg_apis_solution_v1alpha1_Example(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "Example is the Schema for the examples API",
				Properties: map[string]spec.Schema{
					"kind": {
						SchemaProps: spec.SchemaProps{
							Description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#types-kinds",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"apiVersion": {
						SchemaProps: spec.SchemaProps{
							Description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#resources",
							Type:        []string{"string"},
							Format:      "",
						},
					},
					"metadata": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"),
						},
					},
					"spec": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("./pkg/apis/solution/v1alpha1.ExampleSpec"),
						},
					},
					"status": {
						SchemaProps: spec.SchemaProps{
							Ref: ref("./pkg/apis/solution/v1alpha1.ExampleStatus"),
						},
					},
				},
			},
		},
		Dependencies: []string{
			"./pkg/apis/solution/v1alpha1.ExampleSpec", "./pkg/apis/solution/v1alpha1.ExampleStatus", "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta"},
	}
}

func schema_pkg_apis_solution_v1alpha1_ExampleSpec(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "ExampleSpec defines the desired state of Example",
				Properties: map[string]spec.Schema{
					"replicas": {
						SchemaProps: spec.SchemaProps{
							Description: "Number of example Pods to run as part of the Solution",
							Type:        []string{"integer"},
							Format:      "int32",
						},
					},
					"version": {
						SchemaProps: spec.SchemaProps{
							Description: "Version of the example Pods container image",
							Type:        []string{"string"},
							Format:      "",
						},
					},
				},
				Required: []string{"replicas", "version"},
			},
		},
		Dependencies: []string{},
	}
}

func schema_pkg_apis_solution_v1alpha1_ExampleStatus(ref common.ReferenceCallback) common.OpenAPIDefinition {
	return common.OpenAPIDefinition{
		Schema: spec.Schema{
			SchemaProps: spec.SchemaProps{
				Description: "ExampleStatus defines the observed state of Example",
				Properties:  map[string]spec.Schema{},
			},
		},
		Dependencies: []string{},
	}
}
