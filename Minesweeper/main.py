import pygame, asyncio
pygame.init()

from settings import *
from sprites import *


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption(TITLE)
        self.clock = pygame.time.Clock()
        self.running = True

    def new(self):
        self.board = Board()
        self.board.display_board()

    async def run(self):
        self.playing = True

        while self.playing:
            self.clock.tick(FPS)
            self.events()

            # A QUIT event during events() already flips self.playing off;
            # don't draw again once the window is gone.
            if not self.playing:
                break

            self.draw()
            await asyncio.sleep(0)

        if self.running:
            await self.end_screen()

    def draw(self):
        self.screen.fill(BGCOLOUR)
        self.board.draw(self.screen)
        pygame.display.flip()

    def check_win(self):
        for row in self.board.board_list:
            for tile in row:
                if tile.type != "X" and not tile.revealed:
                    return False
        return True

    def events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.playing = False
                self.running = False
                return

            if event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                mx //= TILESIZE
                my //= TILESIZE

                if not (0 <= mx < COLS and 0 <= my < ROWS):
                    return

                if event.button == 1:
                    if not self.board.board_list[mx][my].flagged:
                        if not self.board.dig(mx, my):
                            for row in self.board.board_list:
                                for tile in row:
                                    if tile.flagged and tile.type != "X":
                                        tile.flagged = False
                                        tile.revealed = True
                                        tile.image = tile_not_mine
                                    elif tile.type == "X":
                                        tile.revealed = True
                            self.playing = False

                if event.button == 3:
                    if not self.board.board_list[mx][my].revealed:
                        self.board.board_list[mx][my].flagged = not self.board.board_list[mx][my].flagged

                if self.check_win():
                    self.playing = False
                    for row in self.board.board_list:
                        for tile in row:
                            if not tile.revealed:
                                tile.flagged = True

    async def end_screen(self):
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    return

                if event.type == pygame.MOUSEBUTTONDOWN:
                    return

            await asyncio.sleep(0)


game = Game()


async def main():
    while game.running:
        game.new()
        await game.run()
        await asyncio.sleep(0)

    pygame.quit()


asyncio.run(main())