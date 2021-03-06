'use strict';

import BaseView from '../../framework/base_view';
import Global from '../../framework/global';
import logger from '../../framework/logger';

import { Tournament } from '../../models/tournament';

export default class TournamentTileComponentView extends BaseView {

  constructor(tournament_id) {
    super();

    this.title = "Tournament Tile";
    this.template = "tournament-tile-component";

    this.tournament = null;
    this.tournament_id = tournament_id;

    this.model = { 
      tournament: null,
      can_delete: false,
      num_events: 0,
      is_closed: false
    }

    this.events = {
      "click": {
        ".tournament_details": () => {
          router.navigate("tournament_detail", {}, this.tournament_id);
        },
        ".tournament_publish": () => this.onTournamentPublishClicked(),
        ".tournament_register": () => this.onTournamentRegisterClicked(),
        ".tournament_delete": () => this.onTournamentDeleteClicked()
      }
    }
  }

  async pre_render() {
    logger.info("TournamentTileComponent::pre_render()");
    const user = Global.instance().user;

    this.tournament = new Tournament();

    logger.info("Fetching tournament");
    await this.tournament.fetch_by_id(this.tournament_id);
    await this.tournament.fetch_related();

    this.model.tournament = this.tournament.to_view_model();
    this.model.num_events = this.tournament.count_related_set('events');
    this.model.num_players = this.tournament.count_related_set('players');

    this.model.is_registered = this.tournament.is_player_registered(user);
    this.model.is_published = this.tournament.get('published');
    this.model.is_closed = this.tournament.get('closed');
    this.model.can_modify = user.is_superuser();

    if(this.tournament.get('organizer_id') === user.get_id())
      this.model.can_modify = true;
  }

  onTournamentDeleteClicked() {
    logger.info("onTournamentDeleteClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", () => {
      return this.tournament.destroy();
    });

    router.active_dialog.onClose = () => this.remove_from_parent();
  }

  async onTournamentPublishClicked() {
    logger.info("onTournamentPublishClicked");

    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', true);
    await this.tournament.save();
    this.render();
  }
}
