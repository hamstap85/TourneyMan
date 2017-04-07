'use strict';

class TournamentTileComponentView extends BaseView {

  constructor(tournament_id) {
    super();

    this.title = "Tournament Tile";
    this.template = "tournament-tile-component";

    this.tournament = null;
    this.tournament_id = tournament_id;

    this.model = { 
      tournament: null,
      can_delete: false,
      can_register: false,
      is_registered: false,
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

  pre_render() {
    console.log("TournamentTileComponent::pre_render()");

    this.tournament = new Tournament();

    console.log("Fetching tournament");
    this.tournament.fetch_by_id(this.tournament_id)
      .then( () => {
        this.model.tournament = this.tournament.to_view_model();
        this.model.num_events = this.tournament.count_related_set('events');
        this.model.num_players = this.tournament.count_related_set('players');

        this.model.is_registered = this.tournament.is_player_registered(user);
        this.model.is_published = this.tournament.get('published');
        this.model.can_register = this.tournament.get('published') && !this.tournament.get('started') && !this.model.is_registered;
        this.model.can_modify = user.is_superuser();

        this.model.is_closed = false;
        if(!this.model.can_register && !this.model.is_registered)
          this.model.is_closed = true;

        if(this.tournament.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        this.rebind_events();
      });
  }

  onTournamentDeleteClicked() {
    console.log("onTournamentDeleteClicked");

    if(!this.model.can_modify) return; //perm guard

    router.open_dialog("delete_model", this.tournament);
    router.active_dialog.onClose = () => this.remove_from_parent();
  }

  onTournamentPublishClicked() {
    console.log("onTournamentPublishClicked");

    if(!this.model.can_modify) return; //perm guard

    this.tournament.set('published', true);
    this.tournament.save()
      .then( () => {
        this.render();
      });
  }

  onTournamentRegisterClicked() {
    console.log("onTournamentRegisterClicked");

    if(!this.model.can_register) return; //perm guard

    this.tournament.add_related_to_set('players', window.user);
    this.tournament.save()
      .then( () => {
        this.render();
      });
  }
}
