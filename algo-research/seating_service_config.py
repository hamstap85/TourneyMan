
class SeatingServiceConfig:

    def __init__(self, player_names):
        self.SEATS_PER_TABLE = 3
        self.PLAYERS_COUNT = len(player_names)

        self.INITIAL_POOL_SIZE = self.PLAYERS_COUNT
        self.MAXIMUM_POOL_SIZE = 5000
        self.SCORE_DEVIATION = 1
        self.ITERATION_COUNT = 25

        self.SAMPLE_BAD_ROUNDS = False
        self.BAD_ROUNDS_SAMPLE_PCT = 0.1
        self.BAD_ROUNDS_SCORE_DEVIATION = 3

        self.SPIKE_ROUNDS = False
        self.SPIKE_COUNT = self.PLAYERS_COUNT

        self.END_EARLY_CONSISTENT = True
        self.ITERATION_CONS = 10
