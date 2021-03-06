import { expect } from 'chai';

import EventService from '../../src/app/services/event_service';

import { Event } from '../../src/app/models/event';
import { Round } from '../../src/app/models/round';

describe("EventService", () => {
  context("#add_round", () => {
    it("should properly setup the references between the event and round", async () => {
      const subject = new EventService();

      const event = new Event();
      event.create();
      await event.save();

      const round = new Round();
      round.create();
      await round.save();

      await subject.add_round(event, round);

      expect(round.event).to.eq(event);
      expect(event.get('round_ids')).to.include(round.get_id());
    });
  });

  context("#start_event", () => {
    it("should start the event", async () => {
      const subject = new EventService();

      const event = new Event();
      event.create();

      await subject.start_event(event);

      expect(event.get('started')).to.be.true;
    });
  });
});
