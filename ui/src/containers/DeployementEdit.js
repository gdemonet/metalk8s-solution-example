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
import { editDeployementAction } from '../ducks/app/deployment';

const CreateDeployementContainter = styled.div`
  height: 100%;
  padding: ${padding.base};
  display: inline-block;
`;

const CreateDeployementLayout = styled.div`
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

const SelectValue = styled.label`
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
  version: Yup.string().required()
});

class DeployementCreationForm extends React.Component {
  render() {
    const { intl, match, deployements } = this.props;
    const deployement = deployements.find(
      item =>
        item.name === match.params.deploymentName &&
        item.namespace === match.params.id
    );
    const initialValues = {
      namespace: deployement ? deployement.namespace : '',
      version: deployement ? deployement.version : '',
      name: deployement ? deployement.name : ''
    };

    return (
      <CreateDeployementContainter>
        <CreateDeployementLayout>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={this.props.editDeployement}
          >
            {props => {
              const {
                values,
                touched,
                errors,
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
                    <FormSectionTitle>Edit a Deployment</FormSectionTitle>
                    <SelectFieldContainer>
                      <SelectLabel>Name</SelectLabel>
                      <SelectValue>{values.name}</SelectValue>
                    </SelectFieldContainer>
                    <SelectFieldContainer>
                      <SelectLabel>Namespace</SelectLabel>
                      <SelectValue>{values.namespace}</SelectValue>
                    </SelectFieldContainer>
                    <Input
                      name="version"
                      label={intl.messages.version}
                      value={values.version}
                      onChange={handleChange('version')}
                      error={touched.version && errors.version}
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
                            text={intl.messages.edit}
                            type="submit"
                            disabled={!isEmpty(errors)}
                          />
                        </div>
                      </div>
                    </ActionContainer>
                  </FormSection>
                </Form>
              );
            }}
          </Formik>
        </CreateDeployementLayout>
      </CreateDeployementContainter>
    );
  }
}

function mapStateToProps(state) {
  return {
    deployements: state.app.deployement.list
  };
}

const mapDispatchToProps = dispatch => {
  return {
    editDeployement: body => dispatch(editDeployementAction(body))
  };
};

export default injectIntl(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(DeployementCreationForm)
  )
);
