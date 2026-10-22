# Learning notes

Exactly one coin is lighter. The other eight have equal mass. No coin carries
a visible clue before it is weighed.

Compare equal-size groups. A lower pan is heavier. The exceptional coin is in
the higher pan's group. If the pans balance, it is in the group left out.

Three against three partitions nine candidates into three groups of three.
One against one partitions the remaining three into single coins. In the shown
run the first result is right pan up, and the second is balanced. Therefore the
middle coin in the selected group, which stays off the second weighing, is
the lighter coin.

One weighing has only three observable outcomes. It cannot distinguish nine
possible positions. Two weighings have nine outcome pairs, and the exhaustive
run assigns each position a different pair. Two are sufficient and necessary
in the worst case under these assumptions.

This is divide and conquer using a three-way decision. Calling it binary search
would hide the balanced outcome and imply a sorted input that does not exist.

Integer masses avoid rounding in the executable check. They are model units,
not measurements of real coins. Every displayed count comes from the exhaustive
run. The scene exaggerates the tilt so its direction survives phone playback.
