import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { Button, Input } from '@scality/core-ui';
import { padding, gray, fontSize } from '@scality/core-ui/dist/style/theme';
import { isEmpty } from 'lodash';
import { createCustomresourceAction } from '../ducks/app/customResource';

const CreateCustomresourceContainter = styled.div`
  height: 100%;
  padding: ${padding.base};
  display: inline-block;
`;

const CreateCustomresourceLayout = styled.div`
  height: 100%;
  overflow: auto;
  display: inline-block;
  margin-top: ${padding.base};
  form {
    .sc-input {
      margin: ${padding.smaller} 0;
      .sc-input-label {
        width: 200px;
      }
    }
  }
`;

const SelectLabel = styled.label`
  width: 200px;
  padding: 10px;
  font-size: ${fontSize.base};
`;

const SelectFieldContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

const SelectField = styled.select`
  width: 200px;
`;

const ActionContainer = styled.div`
  display: flex;
  margin: ${padding.large} 0;
  justify-content: flex-end;

  button {
    margin-right: ${padding.large};
  }
`;

const FormSectionTitle = styled.h3`
  margin: 0 ${padding.small} 0;
  color: ${gray};
`;

const FormSection = styled.div`
  padding: 0 ${padding.larger};
  display: flex;
  flex-direction: column;
`;

const validationSchema = Yup.object().shape({
  namespaces: Yup.string().required(),
  version: Yup.string().required(),
  replicas: Yup.number().required(),
  name: Yup.string().required()
});

class CustomresourceCreationForm extends React.Component {
  render() {
    const { intl, namespaces } = this.props;
    const initialValues = {
      namespaces: namespaces.length ? namespaces[0].metadata.name : '',
      version: '',
      replicas: '',
      name: ''
    };

    return (
      <CreateCustomresourceContainter>
        <CreateCustomresourceLayout>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={this.props.createCustomresource}
          >
            {props => {
              const {
                values,
                touched,
                errors,
                dirty,
                setFieldTouched,
                setFieldValue
              } = props;

              //handleChange of the Formik props does not update 'values' when field value is empty
              const handleChange = field => e => {
                const { value, checked, type } = e.target;
                setFieldValue(
                  field,
                  type === 'checkbox' ? checked : value,
                  true
                );
              };
              //touched is not "always" correctly set
              const handleOnBlur = e => setFieldTouched(e.target.name, true);

              return (
                <Form>
                  <FormSection>
                    <FormSectionTitle>
                      {intl.messages.create_new_customResource}
                    </FormSectionTitle>
                    <Input
                      name="name"
                      label={intl.messages.name}
                      value={values.name}
                      onChange={handleChange('name')}
                      error={touched.name && errors.name}
                      onBlur={handleOnBlur}
                    />
                    <SelectFieldContainer>
                      <SelectLabel>{intl.messages.namespace}</SelectLabel>
                      <SelectField
                        name="namespaces"
                        onChange={handleChange('namespaces')}
                        value={values.namespaces}
                        error={touched.namespaces && errors.namespaces}
                        onBlur={handleOnBlur}
                      >
                        {namespaces.map((namespace, idx) => (
                          <option
                            key={`namespace_${idx}`}
                            value={namespace.metadata.name}
                          >
                            {namespace.metadata.name}
                          </option>
                        ))}
                      </SelectField>
                    </SelectFieldContainer>
                    <Input
                      name="version"
                      label={intl.messages.version}
                      value={values.version}
                      onChange={handleChange('version')}
                      error={touched.version && errors.version}
                      onBlur={handleOnBlur}
                    />

                    <Input
                      name="replicas"
                      label={intl.messages.replicas}
                      value={values.replicas}
                      onChange={handleChange('replicas')}
                      error={touched.replicas && errors.replicas}
                      onBlur={handleOnBlur}
                    />

                    <ActionContainer>
                      <div>
                        <div>
                          <Button
                            text={intl.messages.cancel}
                            type="button"
                            outlined
                            onClick={() =>
                              this.props.history.push('/customResource')
                            }
                          />
                          <Button
                            text={intl.messages.create}
                            type="submit"
                            disabled={!dirty || !isEmpty(errors)}
                          />
                        </div>
                      </div>
                    </ActionContainer>
                  </FormSection>
                </Form>
              );
            }}
          </Formik>
        </CreateCustomresourceLayout>
      </CreateCustomresourceContainter>
    );
  }
}

function mapStateToProps(state) {
  return {
    namespaces: state.app.namespaces.list
  };
}

const mapDispatchToProps = dispatch => {
  return {
    createCustomresource: body => dispatch(createCustomresourceAction(body))
  };
};

export default injectIntl(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CustomresourceCreationForm)
  )
);
