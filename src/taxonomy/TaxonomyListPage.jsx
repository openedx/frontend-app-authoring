import React from 'react';
import {
  Button,
  Container,
  FormControl,
  DataTable,
  CardView,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import TaxonomyCard from './TaxonomyCard';

const TaxonomyListPage = ({ intl }) => {
  const orgDefaultValue = intl.formatMessage(messages.orgInputSelectDefaultValue);

  const getHeaderButtons = () => [
    (
      <Button
        variant="link"
        className="text-dark-900"
      >
        {intl.formatMessage(messages.downloadTemplateButtonLabel)}
      </Button>
    ),
    (
      <Button
        iconBefore={Add}
      >
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    ),
  ];

  const getOrgSelect = () => (
    <FormControl as="select" defaultValue={orgDefaultValue} controlClassName="border-0">
      <option>{orgDefaultValue}</option>
    </FormControl>
  );

  return (
    <>
      <style>
        {`
          body {
              background-color: #E9E6E4; /* light-400 */
          }
        `}
      </style>
      <Header isHiddenMainMenu />
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100 box-shadow-down-2">
        <Container size="xl">
          <SubHeader
            title={intl.formatMessage(messages.headerTitle)}
            titleActions={getOrgSelect()}
            headerActions={getHeaderButtons()}
            hideBorder
          />
        </Container>
      </div>
      <div className="bg-light-400 mt-1">
        <Container size="xl">
          <DataTable
            disableElevation
            data={[
              {
                id: '1',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq',
                isSystemDefined: true,
              },
              {
                id: '2',
                name: 'Taxonomy',
                description: 'This is a description',
                isSystemDefined: true,
              },
              {
                id: '3',
                name: 'Taxonomy',
                description: 'This is a description',
                orgsCount: 8,
              },
              {
                id: '4',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq',
                orgsCount: 8,
              },
              {
                id: '5',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq',
              },
              {
                id: '6',
                name: 'Taxonomy Large Large Large Large Large Large Large',
                description: 'This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq This is a short description of the taxonomy. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc dapibus tortor vel mi dapibus sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra kdlsjdksj dkjskemncnx iwjekda dkjasehqwj jehqwjehqwjeh ajdsjdhasjdhsaj nmdnamsewqeqweqw ejkqwjekqwjekqw ejqwkejklwq',
              },
              {
                id: '7',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy.',
              },
              {
                id: '8',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy.',
              },
              {
                id: '9',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy.',
              },
              {
                id: '10',
                name: 'Taxonomy',
                description: 'This is a short description of the taxonomy.',
              },
            ]}
            columns={[
              {
                Header: 'Name',
                accessor: 'name',
              },
              {
                Header: 'Description',
                accessor: 'description',
              },
            ]}
          >
            <CardView
              className="bg-light-400 p-5"
              CardComponent={TaxonomyCard}
            />
          </DataTable>
        </Container>
      </div>
    </>
  );
};

TaxonomyListPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyListPage);
