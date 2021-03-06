import random
from math import floor

from seat import Seat
from table import Table

class Round:
    def __init__(self, players=None, tables=None):
        self._tables = tables if tables else []
        self.players = players if players else []

        self.memo_score = None

    def __str__(self):
        value = ""
        for num, table in enumerate(self._tables):
            value += "TABLE #" + str(num) + "\n"
            value += str(table) + "\n"

        return value

    def __repr__(self):
        return str(self)

    def __len__(self):
        return len(self._tables)

    def num_seats(self):
        return sum([len(t) for t in self._tables])

    def clone(self):
        return Round(players=self.players, tables=[t.clone() for t in self._tables])

    def validate(self):
        player_names = [p.name for p in self.players]
        names = self.get_player_names()

        if len(set(names)) != len(player_names):
            raise Exception("Round Validation Failed");

    def count_tables_of_size(self, num_seats):
        return len([t for t in self._tables if len(t) == num_seats])

    def should_converge(self, round_num, config):
        # No matter what, if this is the first round we should converge on the first
        # attempt at pairing. If we don't something is seriously wrong with the algorithm.
        if round_num == 1:
            return True

        if config.NUM_PLAYERS <= config.SEATS_PER_TABLE:
            return True

        # The number of tables > maximum number of seats per table for us to 
        # have a chance to converge.
        if len(self) < config.SEATS_PER_TABLE:
            return False

        # If there are less tables of maximum size than the number of rounds
        # we will not converge
        if self.count_tables_of_size(config.SEATS_PER_TABLE) <= round_num:
            return False

        #if round_num <= config.MIN_SEATS_PER_TABLE and \
        #config.NUM_PLAYERS >= round_num * config.MIN_SEATS_PER_TABLE:
        #    return True

        #if config.NUM_PLAYERS >= round_num * config.SEATS_PER_TABLE:
        #    return True

        # Otherwise, convergence is possible!
        return True

    def score(self, rescore=False):
        if rescore or not self.memo_score:
            self.memo_score = round(sum(map(lambda t: t.score(), self._tables)), 5)
        return self.memo_score

    def meta_score(self):
        seat_scores = sum([t.seat_scores() for t in self._tables], [])
        lowest_seat_score = min([s[1] for s in seat_scores])

        return sum([t.meta_score(lowest_seat_score) for t in self._tables])

    def record_seating(self):
        [t.record_seating() for t in self._tables]

    def get_unlocked_seats(self):
        unlocked_seats = [t.get_unlocked_seats() for t in self._tables]
        return sum(unlocked_seats, [])

    def unlock_seats(self):
        [t.unlock_seats() for t in self._tables]

    def get_player_names(self):
        all_names = set()

        for t in self._tables:
            all_names.update(t.get_player_names())

        return all_names

    def generate_tables(self, num_unseated, max_seats, min_seats):
        self._tables = []

        while num_unseated > 0:
            to_seat = 0

            if num_unseated % max_seats == 0:
                to_seat = max_seats;
            elif num_unseated > min_seats:
                to_seat = min_seats
            else:
                to_seat = num_unseated;

            self._tables.append(Table([Seat() for i in range(0, to_seat)]))

            num_unseated -= to_seat


    def pair_players(self, players, max_table_size, min_table_size):

        self.generate_tables(len(players), max_table_size, min_table_size)

        random.shuffle(players)
        seats = self.get_unlocked_seats()

        while players:
            p = players.pop()
            s = seats.pop()

            s.seat_player(p)


    def _improve(self, config):
        SEAT = 0
        SCORE = 1
        BETTER_THAN_OCCUPIED_PLAYER = 2

        seat_scores = sum([t.seat_scores() for t in self._tables], [])
        lowest_score = min([ss[SCORE] for ss in seat_scores])
        bad_seats = [ss for ss in seat_scores if ss[SCORE] > lowest_score]

        swapped_players = []

        for bad in config.progress(bad_seats):
            better_seats = []

            # Find a better seat for this player
            for t in self._tables:
                test_results = t.test_seating_scores(bad[SEAT].get_player())

                for res in test_results:
                    if res[SCORE] < bad[SCORE] and res[BETTER_THAN_OCCUPIED_PLAYER]:
                        better_seats.append(res)


            if better_seats:
                new_seat = random.choice(better_seats)[SEAT]
                occupied_player = new_seat.get_player()

                if occupied_player:
                    swapped_players.append(occupied_player)
                    new_seat.unseat_player()

                new_seat.seat_player(bad[SEAT].get_player())
            else:
                swapped_players.append(bad[SEAT].get_player())

            bad[SEAT].unseat_player()

        # shuffle players between all unlocked seats
        new_unlocked_seats = self.get_unlocked_seats()
        random.shuffle(new_unlocked_seats)

        # Randomly seat the swapped out players
        while swapped_players:
            player = swapped_players.pop()
            new_seat = new_unlocked_seats.pop()
            new_seat.seat_player(player)

    def improve(self, config):
        new_round = self.clone()
        new_round._improve(config)

        new_round.unlock_seats()
        new_round.validate()
        return new_round

