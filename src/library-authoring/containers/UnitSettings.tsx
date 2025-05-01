import { useIntl } from "@edx/frontend-platform/i18n";
import { Button, ButtonGroup, Container, Stack } from "@openedx/paragon";
import messages from "./messages";
import { useLibraryContext } from "../common/context/LibraryContext";
import { useContainer } from "../data/apiHooks";

const UnitSettings = () => {
  const intl = useIntl();

  const {
    unitId,
    showOnlyPublished,
    readOnly,
  } = useLibraryContext();

  const { data: container } = useContainer(unitId);

  console.log("AAAAAAAAAAAAAAA");
  console.log(container);

  return (
    <Stack>
      <Container>
        <h3 className="h5">
            {intl.formatMessage(messages.unitVisibilityTitle)}
        </h3>
        <ButtonGroup>
          <Button>Test 1</Button>
          <Button>Test 2</Button>
        </ButtonGroup>
      </Container>
      <hr className="w-100" />
      <Container>
        <h3 className="h5">
            {intl.formatMessage(messages.unitDiscussionTitle)}
        </h3>
      </Container>
    </Stack>
  );
};

export default UnitSettings;
