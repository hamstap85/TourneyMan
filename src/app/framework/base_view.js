"use strict";

import $ from 'jquery';
import _ from 'lodash';
import rivets from 'rivets';
import RivetsFormatters from './formatters';

import Global from './global';
import logger from './logger';

export default class BaseView {

  constructor() {
    this.title = "";
    this.template = "";

    this._el = null;
    this._parent_el = null;
    this._events_bound = false;
    this.container = "#content";

    this.model = {};
    this.view = null; //rivets view
    this.parent_view = null; //base view

    this.modals = {};
    this.current_modal = null;

    this.messenger = window.messenger;

    this.child_views = [];
    this.formatters = new RivetsFormatters(rivets);
    this.formatters.setup(rivets)
  }

  get_element() {
    return this._el;
  }

  async render(parent_el) {
    logger.info("Rendering view: " + this.constructor.name);

    if(this._el === null || parent_el !== undefined) {

      if(parent_el === undefined) {
        logger.warn("WARNING: Rendering Element without Parent");
      } else {
        this._parent_el = parent_el;
      }

      this._el = $("<div style='height: 100%'></div>");
      this._el.append($(`#${this.template}`).html());
      this._el.appendTo(parent_el);
      this.view = rivets.bind(this._el, this.model);
    }

    await this.pre_render();

    if(this._events_bound) {
      this.rebind_events();
    }
    else {
      this._bind_events();
    }

    this.post_render();
  }

  update() {
    logger.info("Updating view: " + this.constructor.name);

    this.view.update(this.model);
  }

  unload() {
    if(!this.view) return;

    for(let sel in this.modals)
      $(".reveal-overlay").remove();

    //Unsubscribe from all global events.
    this.messenger.unsubscribe(this);

    this.modals = {};

    this._unbind_events();
    this.view.unbind();
    this.view = null;
  }

  rebind_events() {
    logger.info("REBIND (events) on " + this.constructor.name);

    if (!this._events_bound) {
      logger.error("Invalid REBIND request. Events must be bound with _bind_events first. In: " + this.constructor.name);
    }

    this._unbind_events();
    this._bind_events();
  }

  pre_render() {}

  post_render() {}

  _bind_events() {
    logger.debug("BIND (events) on " + this.constructor.name);

    if (this._events_bound) {
      logger.error("Invalid BIND request. Events have already been bound. This is a duplication. In: " + this.constructor.name);
    }

    let self = this;

    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        self.get_element().find(el).on(ev, action);
      });
    });

    this._events_bound = true;
  }

  _unbind_events() {
    logger.debug("UNBIND (events) on " + this.constructor.name);

    if (!this._events_bound) {
      throw new Error("Invalid UNBIND request. Events are not currently bound. This is a duplication. In: " + this.constructor.name);
    }

    let self = this;

    _.forIn(this.events, function(bindings, ev) {
      _.forIn(bindings, function(action, el) {
        self.get_element().find(el).off(ev, action);
      });
    });

    this._events_bound = false;
  }

  set_parent_view(parent) {
    this.parent_view = parent;
  }

  add_child_view(selector, view) {
    view.render(this.get_element().find(selector));
    view.set_parent_view(this);
    this.child_views.push(view);
  }

  remove_from_parent() {
    if(this.parent_view !== null) {
      this.parent_view.child_views = _.remove(this.parent_view.child_views, this);
      this.get_element().remove();
    }
  }

  render_children() {
    for(let cv of this.child_views) {
      cv.render();
    }
  }

  // Common Event Handlers
  onMyProfileClicked(el) {
    logger.info("onMyProfileClicked");
    let user_id = Global.instance().user.get_id();

    router.navigate("user_profile", {}, user_id);
  }
}
