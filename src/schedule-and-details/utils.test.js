import { CERTIFICATE_DISPLAY_BEHAVIOR } from './schedule-section/certificate-display-row';
import { validateScheduleAndDetails } from './utils';

const intl = { formatMessage: (message) => message };

describe('validateScheduleAndDetails', () => {
  describe('startDate', () => {
    it('should return without start date errors', () => {
      const errors = validateScheduleAndDetails({ startDate: '01/01/1998' }, false, intl);
      const hasStartDateError = Object.keys(errors).includes('startDate');

      expect(hasStartDateError).toBeFalsy();
    });

    it('should return with start date error', () => {
      const errors = validateScheduleAndDetails({ startDate: null }, false, intl);
      const hasStartDateError = Object.keys(errors).includes('startDate');

      expect(hasStartDateError).toBeTruthy();
    });
  });

  describe('endDate', () => {
    it('should return without end date errors', () => {
      const errors = validateScheduleAndDetails(
        { startDate: '01/01/1998', endDate: '01/01/1999' },
        false,
        intl,
      );
      const hasEndDateError = Object.keys(errors).includes('endDate');

      expect(hasEndDateError).toBeFalsy();
    });

    it('should return with end date error', () => {
      const errors = validateScheduleAndDetails(
        { startDate: '01/01/1998', endDate: '01/01/1997' },
        false,
        intl,
      );
      const hasEndDateError = Object.keys(errors).includes('endDate');

      expect(hasEndDateError).toBeTruthy();
    });
  });

  describe('enrollmentStart', () => {
    it('should return without enrollment start errors when start dates are equal', () => {
      const errors = validateScheduleAndDetails(
        { startDate: '01/01/1998', enrollmentStart: '01/01/1998' },
        false,
        intl,
      );
      const hasEnrollmentStartError = Object.keys(errors).includes('enrollmentStart');

      expect(hasEnrollmentStartError).toBeFalsy();
    });

    it('should return without enrollment start error when enrollment start is before course start', () => {
      const errors = validateScheduleAndDetails(
        { startDate: '01/01/1999', enrollmentStart: '01/01/1998' },
        false,
        intl,
      );
      const hasEnrollmentStartError = Object.keys(errors).includes('enrollmentStart');

      expect(hasEnrollmentStartError).toBeFalsy();
    });

    it('should return without enrollment start error when enrollment start is before enrollment end', () => {
      const errors = validateScheduleAndDetails(
        { enrollmentEnd: '01/01/1999', enrollmentStart: '01/01/1998' },
        false,
        intl,
      );
      const hasEnrollmentStartError = Object.keys(errors).includes('enrollmentStart');

      expect(hasEnrollmentStartError).toBeFalsy();
    });

    it('should return with enrollment start error when enrolllments starts after course start', () => {
      const errors = validateScheduleAndDetails(
        { startDate: '01/01/1998', enrollmentStart: '01/02/1998' },
        false,
        intl,
      );
      const hasEnrollmentStartError = Object.keys(errors).includes('enrollmentStart');

      expect(hasEnrollmentStartError).toBeTruthy();
    });

    it('should return with enrollment start error when enrolllments starts after enrollment end', () => {
      const errors = validateScheduleAndDetails(
        { enrollmentEnd: '01/01/1998', enrollmentStart: '01/02/1998' },
        false,
        intl,
      );
      const hasEnrollmentStartError = Object.keys(errors).includes('enrollmentStart');

      expect(hasEnrollmentStartError).toBeTruthy();
    });
  });

  describe('enrollmentEnd', () => {
    it('should return without enrollment start errors when end dates are equal', () => {
      const errors = validateScheduleAndDetails(
        { enrollmentEnd: '01/01/1998', endDate: '01/01/1999' },
        false,
        intl,
      );
      const hasEnrollmentEndError = Object.keys(errors).includes('enrollmentEnd');

      expect(hasEnrollmentEndError).toBeFalsy();
    });

    it('should return without enrollment start error when enrollment end is before course end', () => {
      const errors = validateScheduleAndDetails(
        { enrollmentEnd: '01/01/1998', endDate: '01/01/1999' },
        false,
        intl,
      );
      const hasEnrollmentEndError = Object.keys(errors).includes('enrollmentEnd');

      expect(hasEnrollmentEndError).toBeFalsy();
    });

    it('should return with enrollment date error', () => {
      const errors = validateScheduleAndDetails(
        { enrollmentEnd: '01/01/1998', endDate: '01/01/1997' },
        false,
        intl,
      );
      const hasEnrollmentEndError = Object.keys(errors).includes('enrollmentEnd');

      expect(hasEnrollmentEndError).toBeTruthy();
    });
  });

  describe('certificateAvailableDate', () => {
    describe('with canShowCertificateAvailableDate false', () => {
      it('should return without certificate available errors when dates are vaild', () => {
        const errors = validateScheduleAndDetails(
          { certificateAvailableDate: '01/01/1999', endDate: '01/01/1998' },
          false,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });

      it('should return without certificate available errors when dates are invaild', () => {
        const errors = validateScheduleAndDetails(
          { certificateAvailableDate: '01/01/1997', endDate: '01/01/1998' },
          false,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });
    });

    describe('with canShowCertificateAvailableDate true', () => {
      it('should return without certificate available errors when dates are vaild', () => {
        const errors = validateScheduleAndDetails(
          { certificateAvailableDate: '01/01/1999', endDate: '01/01/1998' },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });

      it('should return with certificate available error', () => {
        const errors = validateScheduleAndDetails(
          { certificateAvailableDate: '01/01/1997', endDate: '01/01/1998' },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeTruthy();
      });
    });

    describe('with certificatesDisplayBehavior equal to end_with_date', () => {
      it('should return without certificate available errors when date has a value', () => {
        const errors = validateScheduleAndDetails(
          {
            certificateAvailableDate: '01/01/1999',
            certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate,
          },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });

      it('should return with certificate available errors when date is empty', () => {
        const errors = validateScheduleAndDetails(
          {
            certificateAvailableDate: '',
            certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate,
          },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeTruthy();
      });
    });

    describe('with canShowCertificateAvailableDate not equal to end_with_date', () => {
      it('should return without certificate available errors when date is empty', () => {
        const errors = validateScheduleAndDetails(
          {
            certificateAvailableDate: '',
            certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.end,
          },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });

      it('should return without certificate available errors when date is empty', () => {
        const errors = validateScheduleAndDetails(
          {
            certificateAvailableDate: '',
            certificatesDisplayBehavior: CERTIFICATE_DISPLAY_BEHAVIOR.earlyNoInfo,
          },
          true,
          intl,
        );
        const hasCertificateAvailableError = Object.keys(errors).includes('certificateAvailableDate');

        expect(hasCertificateAvailableError).toBeFalsy();
      });
    });
  });

  describe('entranceExamMinimumScore', () => {
    it('should return without exam minimum score errors', () => {
      const errors = validateScheduleAndDetails(
        { entranceExamMinimumScorePct: '25' },
        false,
        intl,
      );
      const hasExamMinimumScoreError = Object.keys(errors).includes('entranceExamMinimumScorePct');

      expect(hasExamMinimumScoreError).toBeFalsy();
    });

    it('should return with exam minimum score error with negative value', () => {
      const errors = validateScheduleAndDetails(
        { entranceExamMinimumScorePct: '-1' },
        false,
        intl,
      );
      const hasExamMinimumScoreError = Object.keys(errors).includes('entranceExamMinimumScorePct');

      expect(hasExamMinimumScoreError).toBeTruthy();
    });

    it('should return with exam minimum score error with value greater than 100', () => {
      const errors = validateScheduleAndDetails(
        { entranceExamMinimumScorePct: '230' },
        false,
        intl,
      );
      const hasExamMinimumScoreError = Object.keys(errors).includes('entranceExamMinimumScorePct');

      expect(hasExamMinimumScoreError).toBeTruthy();
    });

    it('should return with exam minimum score error with non-numerical value', () => {
      const errors = validateScheduleAndDetails(
        { entranceExamMinimumScorePct: 'test' },
        false,
        intl,
      );
      const hasExamMinimumScoreError = Object.keys(errors).includes('entranceExamMinimumScorePct');

      expect(hasExamMinimumScoreError).toBeTruthy();
    });
  });
});
